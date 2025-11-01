// pages/api/process.js
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios'; // npm install axios if not already installed

// IMPORTANT: Configure response limit for large file operations (if deploying to Vercel)
export const config = {
  api: {
    responseLimit: false, // Disable 4MB limit for processing potentially large intermediate files
    bodyParser: false, // Disable body parsing for this route
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let { videoId, sourceLang, targetLang } = req.body;

  // Fallbacks in case body parsing doesn't work as expected by Next.js
  // You might need to parse the body manually if issues arise
  if (typeof req.body === 'string') {
     try {
        const parsedBody = JSON.parse(req.body);
        videoId = parsedBody.videoId;
        sourceLang = parsedBody.sourceLang;
        targetLang = parsedBody.targetLang;
     } catch (e) {
        console.error('Error parsing request body:', e);
        return res.status(400).json({ message: 'Invalid request body' });
     }
  }

  if (!videoId || !sourceLang || !targetLang) {
    console.error('Missing required parameters:', { videoId, sourceLang, targetLang });
    return res.status(400).json({ message: 'Missing videoId, sourceLang, or targetLang' });
  }

  const tempDir = path.join(process.cwd(), 'temp_uploads');
  const metadataPath = path.join(tempDir, `${videoId}_metadata.json`);
  const videoPath = path.join(tempDir, `${videoId}.mp4`);

  if (!fs.existsSync(metadataPath) || !fs.existsSync(videoPath)) {
    console.error('Files not found:', { metadataPath: fs.existsSync(metadataPath), videoPath: fs.existsSync(videoPath) });
    return res.status(404).json({ message: 'Video or metadata not found' });
  }

  try {
    // --- PHASE 1: Audio Extraction ---
    console.log(`[${videoId}] Starting Phase 1: Audio Extraction`);
    const audioPath = path.join(tempDir, `${videoId}_audio.wav`);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat('wav') // Ensure output is WAV for Whisper
        .audioChannels(1) // Mono for Whisper
        .audioFrequency(16000) // 16kHz for Whisper
        .output(audioPath)
        .on('end', () => {
            console.log(`[${videoId}] Audio extracted: ${audioPath}`);
            resolve();
        })
        .on('error', (err) => {
            console.error(`[${videoId}] FFmpeg Error during extraction:`, err);
            reject(err);
        })
        .run();
    });

    // --- PHASE 2: ASR -> Translation -> TTS ---
    console.log(`[${videoId}] Starting Phase 2: ASR -> Translation -> TTS`);
    const dubbedAudioPath = path.join(tempDir, `${videoId}_dubbed_audio.wav`);

    // Step 1: ASR (Whisper via Hugging Face)
    console.log(`[${videoId}] Calling Whisper ASR...`);
    const transcribedText = await transcribeAudioWithWhisper(audioPath, sourceLang);
    console.log(`[${videoId}] ASR Result:`, transcribedText);

    // Step 2: Translation (Google Translate Free Tier)
    console.log(`[${videoId}] Calling Translation...`);
    const translatedText = await translateTextWithGoogle(transcribedText, sourceLang, targetLang);
    console.log(`[${videoId}] Translation Result:`, translatedText);

    // Step 3: TTS (Google TTS Free Tier)
    console.log(`[${videoId}] Calling Google TTS...`);
    await generateTTSWithGoogle(translatedText, dubbedAudioPath, targetLang);
    console.log(`[${videoId}] TTS Audio Generated: ${dubbedAudioPath}`);

    // --- PHASE 3: Merging Audio with Video ---
    console.log(`[${videoId}] Starting Phase 3: Merging Dubbed Audio`);
    const outputPath = path.join(tempDir, `${videoId}_dubbed.mp4`);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath) // Input video
        .input(dubbedAudioPath) // Input new audio
        .outputOptions([
          '-c:v copy', // Copy video stream without re-encoding (faster)
          '-c:a aac',  // Encode audio to aac
          '-strict experimental'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`[${videoId}] Merging completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`[${videoId}] FFmpeg Error during merge:`, err);
          reject(err);
        })
        .run();
    });

    // Update metadata status
    const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf8'));
    metadata.status = 'completed';
    metadata.outputPath = outputPath;
    metadata.processedTimestamp = new Date().toISOString(); // Add processing timestamp
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata));

    res.status(200).json({ message: 'Processing successful', videoId, status: 'completed' });

  } catch (error) {
    console.error(`[${videoId}] Processing Error:`, error);
    // Attempt to update metadata status to failed
    try {
        const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf8'));
        metadata.status = 'failed';
        metadata.error = error.message;
        await fs.promises.writeFile(metadataPath, JSON.stringify(metadata));
    } catch (metaErr) {
        console.error(`[${videoId}] Failed to update metadata on error:`, metaErr);
    }
    res.status(500).json({ message: 'Processing failed', error: error.message });
  }
}

// --- ASR Function using Hugging Face Inference API (Free Tier) ---
// You need a Hugging Face token: https://huggingface.co/settings/tokens
// Use the free tier - it has rate limits but is sufficient for testing.
// Model: https://huggingface.co/openai/whisper-large-v3
async function transcribeAudioWithWhisper(audioFilePath, sourceLang) {
  const HF_API_TOKEN = process.env.HF_API_TOKEN; // Store your token in .env.local
  if (!HF_API_TOKEN) {
    throw new Error("HF_API_TOKEN environment variable is required for Whisper ASR.");
  }

  const url = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
  // Note: Whisper v3 often auto-detects language, but you can specify if needed.
  // const params = { language: sourceLang }; // Example: "en", "es", "hi"

  const data = fs.readFileSync(audioFilePath);

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "audio/wav", // Or audio/mp3, etc., depending on input
      },
      // Optional: Add parameters like language if the model supports it via query params
      // params: params,
      timeout: 300000, // 5 minutes timeout, Whisper can take time
    });

    // The response structure depends on the model. For Whisper, it's usually { text: "..." }
    if (response.data && typeof response.data.text === 'string') {
        return response.data.text.trim();
    } else {
        console.error("Unexpected ASR response format:", response.data);
        throw new Error("ASR returned unexpected data format.");
    }
  } catch (error) {
    console.error("Whisper ASR Error:", error.response?.data || error.message);
    throw error;
  }
}


// --- Translation Function using Google Translate API Free Tier ---
// Google Translate API is not truly "free" forever, but has a generous free tier ($200/month credit).
// You need a Google Cloud Project with Translate API enabled and a key.
// https://cloud.google.com/translate/docs/setup
async function translateTextWithGoogle(text, sourceLang, targetLang) {
  const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY; // Store your key in .env.local
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error("GOOGLE_TRANSLATE_API_KEY environment variable is required for translation.");
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;

  const requestBody = {
    q: text,
    source: sourceLang,
    target: targetLang,
    format: "text" // Can also be "html"
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds timeout
    });

    if (response.data && response.data.data && response.data.data.translations && response.data.data.translations[0]) {
        return response.data.data.translations[0].translatedText;
    } else {
        console.error("Unexpected Translation response format:", response.data);
        throw new Error("Translation API returned unexpected data format.");
    }
  } catch (error) {
    console.error("Google Translation Error:", error.response?.data || error.message);
    throw error;
  }
}

// --- TTS Function using Google Cloud Text-to-Speech API Free Tier ---
// Requires Google Cloud Project with TTS API enabled and a key.
// https://cloud.google.com/text-to-speech/docs/setup
async function generateTTSWithGoogle(text, outputPath, targetLang) {
  const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY; // Store your key in .env.local
  if (!GOOGLE_TTS_API_KEY) {
    throw new Error("GOOGLE_TTS_API_KEY environment variable is required for TTS.");
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

  // Define the TTS request body
  const requestBody = {
    input: {
      text: text
    },
    voice: {
      // Select a voice based on target language. Examples:
      languageCode: targetLang, // e.g., 'en-US', 'es-ES', 'hi-IN'
      // ssmlGender: 'NEUTRAL' // MALE, FEMALE, NEUTRAL
    },
    audioConfig: {
      audioEncoding: 'LINEAR16', // WAV format
      // Optional: Adjust speaking rate/pitch if needed for timing
      // speakingRate: 1.0,
      // pitch: 0.0
    }
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000, // 1 minute timeout for TTS
    });

    if (response.data && response.data.audioContent) {
        // Decode the base64 audio content and write to file
        const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
        await fs.promises.writeFile(outputPath, audioBuffer);
        console.log(`TTS audio saved to: ${outputPath}`);
    } else {
        console.error("Unexpected TTS response format:", response.data);
        throw new Error("TTS API returned unexpected data format.");
    }
  } catch (error) {
    console.error("Google TTS Error:", error.response?.data || error.message);
    throw error;
  }
}