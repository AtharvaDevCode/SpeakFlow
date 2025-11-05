// pages/api/process.js
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process'; // Import exec for ffprobe and atempo stretching
import { promisify } from 'util';
import { GoogleGenerativeAI } from "@google/generative-ai";

const execAsync = promisify(exec); // Promisify exec for easier async/await usage

export const config = {
  api: {
    responseLimit: false, // Disable 4MB limit for processing potentially large intermediate files and downloads
    bodyParser: false,    // Disable automatic body parsing - we handle it manually
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // --- Manually parse the JSON body ---
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    req.on('end', resolve);
    req.on('error', reject);
  });

  let { videoId, sourceLang, targetLang } = {};
  try {
    const parsedBody = JSON.parse(body);
    videoId = parsedBody.videoId;
    sourceLang = parsedBody.sourceLang;
    targetLang = parsedBody.targetLang;
  } catch (e) {
    console.error('Error parsing JSON body in process.js:', e);
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  // --- END Manual Parsing ---

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
        .toFormat('wav') // Ensure output is WAV for Whisper/ASR
        .audioChannels(1) // Mono for Whisper/ASR
        .audioFrequency(16000) // 16kHz for Whisper/ASR
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

    // --- PHASE 2: ASR -> Translation -> TTS -> Sync Adjustment ---
    console.log(`[${videoId}] Starting Phase 2: ASR -> Translation -> TTS -> Sync Adjustment`);
    const dubbedAudioPath_MP3 = path.join(tempDir, `${videoId}_dubbed_audio.mp3`); // Output path for raw TTS audio (MP3)
    const dubbedAudioPathAdjusted_MP3 = path.join(tempDir, `${videoId}_dubbed_audio_adjusted.mp3`); // Output path for time-stretched audio (MP3)

    // Step 1: ASR (AssemblyAI - FREE Tier Available)
    console.log(`[${videoId}] Calling AssemblyAI ASR...`);
    const transcribedText = await transcribeAudioWithAssemblyAI(audioPath, sourceLang);
    console.log(`[${videoId}] ASR Result:`, transcribedText);

    // Step 2: Translation (Gemini API - Cost Incurred) - Dubbing Focused Prompt
    console.log(`[${videoId}] Calling Gemini for Dubbing-Focused Translation...`);
    const translatedText = await translateWithGemini(transcribedText, sourceLang, targetLang);
    console.log(`[${videoId}] Translation Result:`, translatedText);

    // Step 3: TTS (ElevenLabs - Cost Incurred via API usage, Falls back to Google TTS if no key)
    console.log(`[${videoId}] Calling TTS (ElevenLabs or Google TTS)...`);
    await generateTTSWithElevenLabs(translatedText, dubbedAudioPath_MP3, targetLang); // Pass the .mp3 path
    console.log(`[${videoId}] TTS Audio Generated: ${dubbedAudioPath_MP3}`);

    // Step 4: Sync Adjustment (Time-Stretch TTS Audio to Match Original Duration)
    console.log(`[${videoId}] Adjusting TTS Audio Duration to Match Original...`);
    await adjustAudioDurationWithFFmpeg(audioPath, dubbedAudioPath_MP3, dubbedAudioPathAdjusted_MP3); // Pass original, raw TTS, and target adjusted paths
    console.log(`[${videoId}] TTS Audio Duration Adjusted: ${dubbedAudioPathAdjusted_MP3}`);

    // --- PHASE 3: Merging Audio with Video ---
    console.log(`[${videoId}] Starting Phase 3: Merging Adjusted Dubbed Audio`);
    const outputPath = path.join(tempDir, `${videoId}_dubbed.mp4`);

    // Use a Promise to handle the FFmpeg merge process correctly with explicit mapping
    await new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg(videoPath) // Input video file (contains original audio)
        .input(dubbedAudioPathAdjusted_MP3) // Input adjusted TTS audio file (.mp3)
        .outputOptions([
          '-map', '0:v',    // Explicitly map the video stream from the first input (videoPath)
          '-map', '1:a',    // Explicitly map the audio stream from the second input (dubbedAudioPathAdjusted_MP3)
          '-c:v', 'copy',   // Copy video stream without re-encoding (faster)
          '-c:a', 'aac',    // Encode the mapped audio stream to AAC
          '-strict', 'experimental', // Might be needed for certain AAC encodings
        ])
        .output(outputPath);

      ffmpegCommand
        .on('start', (cmd) => {
          console.log(`FFmpeg merge command started: ${cmd}`);
        })
        .on('progress', (progress) => {
          // Optional: Log progress
          // console.log(`FFmpeg merge progress: frame=${progress.frame}, timemark=${progress.timemark}, fps=${progress.fps}`);
        })
        .on('end', (stdout, stderr) => {
          console.log(`[${videoId}] Merging completed: ${outputPath}`);
          if (stderr) {
              console.warn(`[${videoId}] FFmpeg merge stderr (warnings): ${stderr}`); // Log warnings
          }
          // Clean up intermediate files after successful merge
          fs.unlink(dubbedAudioPath_MP3, (err) => {
             if (err) console.error(`[${videoId}] Error deleting raw TTS file:`, err);
             else console.log(`[${videoId}] Deleted raw TTS file: ${dubbedAudioPath_MP3}`);
          });
          resolve(); // Resolve the promise on successful end
        })
        .on('error', (err, stdout, stderr) => {
          console.error(`[${videoId}] FFmpeg ERROR during merge:`, err.message);
          console.error(`[${videoId}] FFmpeg merge stdout:`, stdout); // Log stdout in case of error
          console.error(`[${videoId}] FFmpeg merge stderr:`, stderr); // Log stderr in case of error
          reject(err); // Reject the promise on error
        })
        .run();
    });

    // Update metadata status
    const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf8'));
    metadata.status = 'completed';
    metadata.outputPath = outputPath;
    metadata.processedTimestamp = new Date().toISOString();
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata));

    res.status(200).json({ message: 'Processing successful', videoId, status: 'completed' });

  } catch (error) {
    console.error(`[${videoId}] Processing Error:`, error);
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

// --- ASR Function using AssemblyAI (FREE Tier Available) ---
async function transcribeAudioWithAssemblyAI(audioFilePath, sourceLang) {
  const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY environment variable is required for AssemblyAI ASR.");
  }

  const endpoint = 'https://api.assemblyai.com/v2'; // Corrected endpoint (removed trailing spaces)

  // Step 1: Upload the audio file
  console.log("Uploading audio to AssemblyAI...");
  const audioData = fs.readFileSync(audioFilePath);
  const uploadResponse = await fetch(`${endpoint}/upload`, {
    method: 'POST',
    body: audioData,
    headers: {
      'Authorization': ASSEMBLYAI_API_KEY,
    },
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("AssemblyAI Upload Error:", uploadResponse.status, errorText);
    throw new Error(`AssemblyAI Upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  const uploadData = await uploadResponse.json();
  const audioUrl = uploadData.upload_url;
  console.log("Audio uploaded successfully. URL:", audioUrl);

  // Step 2: Request transcription
  console.log("Requesting transcription from AssemblyAI...");
  const transcribeResponse = await fetch(`${endpoint}/transcript`, {
    method: 'POST',
    body: JSON.stringify({
      audio_url: audioUrl,
      // language_code: sourceLang, // Optional: Specify language if needed, AssemblyAI often auto-detects
    }),
    headers: {
      'Authorization': ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!transcribeResponse.ok) {
    const errorText = await transcribeResponse.text();
    console.error("AssemblyAI Transcribe Request Error:", transcribeResponse.status, errorText);
    throw new Error(`AssemblyAI Transcribe Request failed: ${transcribeResponse.status} - ${errorText}`);
  }

  const transcribeData = await transcribeResponse.json();
  const transcriptId = transcribeData.id;
  console.log("Transcription request submitted. ID:", transcriptId);

  // Step 3: Poll for completion
  console.log("Polling for transcription completion...");
  let pollingEndpoint = `${endpoint}/transcript/${transcriptId}`;
  let result;
  while (true) { // Simple polling loop
    const pollResponse = await fetch(pollingEndpoint, {
      headers: { 'Authorization': ASSEMBLYAI_API_KEY },
    });

    if (!pollResponse.ok) {
      const errorText = await pollResponse.text();
      console.error("AssemblyAI Polling Error:", pollResponse.status, errorText);
      throw new Error(`AssemblyAI Polling failed: ${pollResponse.status} - ${errorText}`);
    }

    result = await pollResponse.json();
    const status = result.status;

    if (status === 'completed') {
      console.log("AssemblyAI transcription completed.");
      break; // Exit the loop
    } else if (status === 'error') {
      console.error("AssemblyAI transcription failed:", result.error);
      throw new Error(`AssemblyAI Transcription Error: ${result.error}`);
    } else {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before next poll
    }
  }

  // Return the transcribed text
  if (result.text !== undefined) {
      console.log("Raw AssemblyAI Result:", { text: result.text, confidence: result.confidence });
      return result.text.trim();
  } else {
      console.error("Unexpected AssemblyAI response format:", result);
      throw new Error("AssemblyAI returned unexpected data format.");
  }
}

// --- Translation Function using Google Gemini API (2.5 Flash) - Dubbing Focused ---
async function translateWithGemini(text, sourceLang, targetLang) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required for Gemini Translation.");
  }

  // Initialize the Google AI SDK client
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // Use the available model: gemini-2.5-flash (or gemini-2.5-pro, gemini-flash-latest, gemini-pro-latest)
  // Based on the model listing you provided, gemini-2.5-flash is available and supports generateContent.
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Updated model name

  // Craft the prompt for translation, focused on dubbing
  // Ask Gemini to translate while keeping the sentence structure and approximate word count similar
  // to the original text to help with audio timing during dubbing.
  const prompt = `
You are a translator tasked with preparing text for audio dubbing. Your goal is to translate the provided ${sourceLang} text into ${targetLang} while preserving the original sentence structure and rhythm as closely as possible. This is crucial for aligning the translated audio with the original video's timing.

Please follow these guidelines:
1.  **Translate accurately:** Ensure the meaning of the original text is correctly conveyed.
2.  **Preserve Structure:** Keep sentences broken up in a similar way. If the original has 3 sentences, aim for 3 translated sentences.
3.  **Match Rhythm/Approximate Length:** Try to use a similar number of words and syllables where possible. Avoid making sentences significantly longer or shorter than the original. This helps the generated speech match the original audio's duration.
4.  **Output Only Translation:** Provide only the translated text, nothing else.

Original ${sourceLang} text:
${text}
`;

  try {
    console.log(`Calling Gemini API for dubbing-focused translation (Model: ${model.model}) from ${sourceLang} to ${targetLang}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    if (!translatedText) {
        throw new Error("Gemini API returned empty translation text.");
    }

    console.log("Raw Gemini Translation Response:", response);
    console.log("Final translated text for TTS:", translatedText.trim());
    return translatedText.trim(); // Return the translated text

  } catch (error) {
    console.error("Gemini Translation Error:", error);
    // Check for specific error details from the API
    if (error.message) {
        console.error("Gemini Error Message:", error.message);
    }
    throw error;
  }
}

// --- TTS Function: Generate Speech using ElevenLabs API (Primary) or Google Translate TTS (Fallback) ---
// Uses the ElevenLabs API as primary, and falls back to an unofficial Google Translate TTS API if no ElevenLabs key is found.
// Note: ElevenLabs restricts access from certain countries (e.g., Russia, Iran, North Korea, Belarus, Syria, Cuba, Crimea, Donetsk, Luhansk).
async function generateTTSWithElevenLabs(text, outputPath, targetLang) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  // Check if ElevenLabs API key exists
  if (ELEVENLABS_API_KEY) {
    console.log("Using ElevenLabs API for TTS.");
    await generateTTSWithElevenLabsAPI(text, outputPath, targetLang, ELEVENLABS_API_KEY);
  } else {
    console.log("ELEVENLABS_API_KEY not found. Falling back to unofficial Google Translate TTS.");
    await generateTTSWithGoogleTTS(text, outputPath, targetLang);
  }
}

// --- Primary TTS Function: Generate Speech using ElevenLabs API ---
async function generateTTSWithElevenLabsAPI(text, outputPath, targetLang, apiKey) {
  // ElevenLabs voice ID mapping - Updated with the correct Hindi voice ID
  const voiceIdMap = {
      'hi': 'jUjRbhZWoMK4aDciW36V', // Corrected Hindi voice ID
      'en': '21m00Tcm4TlvDq8ikWAM', // Example English voice ID (replace if needed)
      'es': 'EXAVITQu4vr4xnSDxMaL', // Example Spanish voice ID (replace if needed)
      // Add more mappings as needed
  };

  // Select voice ID based on target language, default to English if not found
  const voiceId = voiceIdMap[targetLang] || voiceIdMap['en'];
  console.log(`Using ElevenLabs voice ID: ${voiceId} for target language: ${targetLang}`);

  // Define the output format - Using MP3 as WAV is not supported by the API
  // Options include: mp3_22050_32, mp3_24000_48, mp3_44100_32, mp3_44100_64, etc.
  const outputFormat = 'mp3_22050_32'; // Using MP3 format
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId.trim()}?optimize_streaming_latency=0&output_format=${outputFormat}`; // Corrected URL (removed trailing spaces)

  const requestBody = {
    text: text,
    // You can add other options here if needed, like voice_settings, model_id, etc.
    // For example, to adjust stability or similarity_boost:
    // voice_settings: {
    //   stability: 0.75,
    //   similarity_boost: 0.75
    // }
  };

  try {
    console.log(`Calling ElevenLabs TTS API for text: "${text.substring(0, 30)}..." using voice: ${voiceId} and format: ${outputFormat}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey, // Use the passed API key
        'Content-Type': 'application/json',
        // 'accept': 'audio/mpeg', // Optional: specify expected format if different from output_format parameter
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs TTS API Error:", response.status, response.statusText, errorText);
      throw new Error(`ElevenLabs TTS API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Read the audio data from the response body (it's a stream)
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Write the audio buffer to the specified output file path
    // The output path will now be an .mp3 file, which is fine for FFmpeg merging
    await fs.promises.writeFile(outputPath, audioBuffer);

    console.log(`ElevenLabs TTS audio saved to: ${outputPath}`);

  } catch (error) {
    console.error(`ElevenLabs TTS API Error in generateTTSWithElevenLabsAPI:`, error);
    throw error;
  }
}

// --- Fallback TTS Function: Generate Speech using Unofficial Google Translate TTS API (Handles Long Text) ---
async function generateTTSWithGoogleTTS(text, outputPath, targetLang) {
    const translate = require('google-tts-api'); // Import the library

    const lang = targetLang;

    try {
        console.log(`[GoogleTTS] Splitting and processing long text for TTS (language: ${lang})`);
        // Use getAllAudioUrls to handle long text. This returns an array of URLs for chunks.
        // It automatically splits the text based on the character limit.
        const audioUrls = translate.getAllAudioUrls(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        console.log(`[GoogleTTS] Generated ${audioUrls.length} audio chunk(s).`);

        // Fetch each audio chunk and store the buffers
        const audioBuffers = [];
        for (let i = 0; i < audioUrls.length; i++) {
            const chunkUrl = audioUrls[i].url; // Extract the URL from the object
            console.log(`[GoogleTTS] Fetching chunk ${i + 1}/${audioUrls.length} from: ${chunkUrl.substring(0, 100)}...`); // Log first 100 chars of URL
            const response = await fetch(chunkUrl);
            if (!response.ok) {
                throw new Error(`Google TTS Chunk ${i + 1} Error: ${response.status} ${response.statusText}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            audioBuffers.push(buffer);
        }

        // Concatenate the audio buffers using FFmpeg
        console.log(`[GoogleTTS] Concatenating ${audioBuffers.length} audio chunks using FFmpeg...`);
        const tempConcatDir = path.join(process.cwd(), 'temp_uploads', 'tts_chunks');
        fs.mkdirSync(tempConcatDir, { recursive: true }); // Create directory if it doesn't exist

        // Write each chunk buffer to a temporary file
        const tempChunkFiles = [];
        for (let i = 0; i < audioBuffers.length; i++) {
            const chunkFileName = `chunk_${Date.now()}_${i}.mp3`;
            const chunkFilePath = path.join(tempConcatDir, chunkFileName);
            await fs.promises.writeFile(chunkFilePath, audioBuffers[i]);
            tempChunkFiles.push(chunkFilePath);
        }

        // Create a temporary file list for FFmpeg's concat demuxer
        const fileListPath = path.join(tempConcatDir, `file_list_${Date.now()}.txt`);
        const fileListContent = tempChunkFiles.map(file => `file '${file}'`).join('\n');
        await fs.promises.writeFile(fileListPath, fileListContent);

        // Use FFmpeg to concatenate the files
        const finalOutputPath = outputPath; // The final output path
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(fileListPath)
                .inputOptions(['-f', 'concat', '-safe', '0']) // Input options for concat demuxer
                .outputOptions(['-c', 'copy']) // Copy streams without re-encoding for speed
                .output(finalOutputPath)
                .on('start', (cmd) => {
                    console.log(`[GoogleTTS] FFmpeg concat command started: ${cmd}`);
                })
                .on('end', (stdout, stderr) => {
                    console.log(`[GoogleTTS] FFmpeg concat completed: ${finalOutputPath}`);
                    if (stderr) {
                        console.warn(`[GoogleTTS] FFmpeg concat stderr (warnings): ${stderr}`);
                    }
                    resolve();
                })
                .on('error', (err, stdout, stderr) => {
                    console.error(`[GoogleTTS] FFmpeg concat ERROR:`, err.message);
                    console.error(`[GoogleTTS] FFmpeg concat stdout:`, stdout);
                    console.error(`[GoogleTTS] FFmpeg concat stderr:`, stderr);
                    reject(err);
                })
                .run();
        });

        // Clean up temporary chunk files and the list file after successful concatenation
        console.log(`[GoogleTTS] Cleaning up temporary chunk files and list...`);
        try {
            await fs.promises.unlink(fileListPath);
            for (const chunkFile of tempChunkFiles) {
                await fs.promises.unlink(chunkFile);
            }
            // Optionally, remove the directory if it's empty
            fs.rmdirSync(tempConcatDir); // This will fail if directory is not empty, which is okay.
        } catch (cleanupErr) {
            console.error(`[GoogleTTS] Error cleaning up temporary files:`, cleanupErr);
            // Depending on your needs, you might want to throw the error or just log it.
            // For now, we just log it to avoid stopping the main process.
        }

        console.log(`[GoogleTTS] Final concatenated audio saved to: ${finalOutputPath}`);

    } catch (error) {
        console.error(`[GoogleTTS] Error in generateTTSWithGoogleTTS:`, error);
        throw error; // Re-throw to be caught by the main handler
    }
}


// --- Sync Adjustment Function: Manipulate TTS Audio to Fit Original Video Length (Precise) ---
// This function gets the duration of the original video audio and the generated TTS audio.
// It calculates the overall speed factor needed to make the TTS audio duration match the original.
// It then applies the necessary 'rubberband' filter to change tempo and duration precisely,
// keeping pitch constant. If 'rubberband' is not available, it falls back to chained 'atempo'
// filters (0.5-2.0 range) and then ensures the exact duration using 'atrim' and 'apad'.
async function adjustAudioDurationWithFFmpeg(originalAudioPath, ttsAudioPath, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`[${path.basename(outputPath, '.mp3')}] Starting precise audio duration adjustment to match original...`);

      // 1. Get original audio duration using ffprobe
      console.log(`[${path.basename(outputPath, '.mp3')}] Getting original audio duration from: ${originalAudioPath}`);
      const originalDurationCommand = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${originalAudioPath}"`;
      const { stdout: originalDurationOutput } = await execAsync(originalDurationCommand);
      const originalDuration = parseFloat(originalDurationOutput.trim());
      if (isNaN(originalDuration) || originalDuration <= 0) {
          throw new Error(`Invalid original duration retrieved: ${originalDurationOutput.trim()}`);
      }
      console.log(`[${path.basename(outputPath, '.mp3')}] Original audio duration: ${originalDuration.toFixed(3)}s`);

      // 2. Get TTS audio duration using ffprobe
      console.log(`[${path.basename(outputPath, '.mp3')}] Getting TTS audio duration from: ${ttsAudioPath}`);
      const ttsDurationCommand = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${ttsAudioPath}"`;
      const { stdout: ttsDurationOutput } = await execAsync(ttsDurationCommand);
      const ttsDuration = parseFloat(ttsDurationOutput.trim());
      if (isNaN(ttsDuration) || ttsDuration <= 0) {
          throw new Error(`Invalid TTS duration retrieved: ${ttsDurationOutput.trim()}`);
      }
      console.log(`[${path.basename(outputPath, '.mp3')}] TTS audio duration: ${ttsDuration.toFixed(3)}s`);

      // 3. Calculate overall speed factor needed (target_duration / current_duration)
      const overallSpeedFactor = originalDuration / ttsDuration;
      console.log(`[${path.basename(outputPath, '.mp3')}] Overall speed factor needed (original/tts): ${overallSpeedFactor.toFixed(4)}`);

      // --- Method 1: Attempt using 'rubberband' for precise duration matching ---
      // Rubberband is generally better for tempo/pitch shifting with quality.
      // It can directly target a duration or tempo change.
      const targetTempo = 1.0 / overallSpeedFactor; // If speed needs to be 1.2x, tempo should be 1/1.2 = 0.833x
      console.log(`[${path.basename(outputPath, '.mp3')}] Calculated target tempo for rubberband: ${targetTempo.toFixed(4)}x`);

      const rubberbandCommand = `ffmpeg -i "${ttsAudioPath}" -af "rubberband=tempo=${targetTempo.toFixed(4)}" -y "${outputPath}"`;

      try {
        console.log(`[${path.basename(outputPath, '.mp3')}] Attempting adjustment with rubberband: ${rubberbandCommand}`);
        const { stdout: rbStdout, stderr: rbStderr } = await execAsync(rubberbandCommand);
        if (rbStderr) {
            // Rubberband might output warnings/info here, log them.
            console.warn(`[${path.basename(outputPath, '.mp3')}] FFmpeg rubberband stderr (warnings/info): ${rbStderr}`);
        }
        console.log(`[${path.basename(outputPath, '.mp3')}] Rubberband adjustment completed.`);
        // If rubberband command succeeds, the file should be at the target duration.
        // We can optionally verify the duration here and correct further if needed.
        // For now, assume it worked and resolve.
        console.log(`[${path.basename(outputPath, '.mp3')}] Audio duration adjustment (using rubberband) completed: ${outputPath}`);
        resolve();
        return; // Exit the function after successful rubberband adjustment

      } catch (rbError) {
        console.warn(`[${path.basename(outputPath, '.mp3')}] FFmpeg rubberband failed (might not be available or supported):`, rbError.message);
        console.log(`[${path.basename(outputPath, '.mp3')}] Falling back to chained 'atempo' method...`);
        // If rubberband fails, proceed to the fallback method below.
      }

      // --- Fallback Method 2: Chained 'atempo' + Duration Verification + Correction ---
      // This handles cases where rubberband isn't available.

      // Determine the sequence of 'atempo' filters required (range 0.5 to 2.0 per filter)
      let atempoFilters = [];
      let tempFactor = overallSpeedFactor;

      if (tempFactor > 1) {
          // Speeding up: Use factors up to 2.0
          while (tempFactor > 1) {
              const nextFactor = Math.min(2.0, tempFactor);
              atempoFilters.push(nextFactor);
              tempFactor /= nextFactor;
          }
      } else if (tempFactor < 1) {
          // Slowing down: Use factors down to 0.5
          while (tempFactor < 1) {
              const nextFactor = Math.max(0.5, tempFactor);
              atempoFilters.push(nextFactor);
              tempFactor /= nextFactor;
          }
      }

      const atempoFilterString = atempoFilters.map(f => `atempo=${f.toFixed(2)}`).join(',');
      console.log(`[${path.basename(outputPath, '.mp3')}] Calculated atempo filters for fallback: ${atempoFilterString || 'None (factor is 1.0)'}`);

      const tempAdjustedPath = `${outputPath}.temp_atempo.mp3`; // Temporary file for atempo output
      let atempoCommand;
      if (atempoFilterString) {
          atempoCommand = `ffmpeg -i "${ttsAudioPath}" -af "${atempoFilterString}" -y "${tempAdjustedPath}"`;
      } else {
          // If no adjustment needed, just copy
          console.log(`[${path.basename(outputPath, '.mp3')}] No atempo adjustment needed (factor is 1.0), copying...`);
          atempoCommand = `ffmpeg -i "${ttsAudioPath}" -c copy -y "${tempAdjustedPath}"`;
      }

      console.log(`[${path.basename(outputPath, '.mp3')}] Executing atempo command: ${atempoCommand}`);
      const { stdout: atempoStdout, stderr: atempoStderr } = await execAsync(atempoCommand);
      if (atempoStderr) {
          console.warn(`[${path.basename(outputPath, '.mp3')}] FFmpeg atempo stderr (warnings/info): ${atempoStderr}`);
      }

      // --- Verify Duration and Correct ---
      // Get the duration of the file after atempo adjustment
      console.log(`[${path.basename(outputPath, '.mp3')}] Verifying duration of atempo-adjusted file: ${tempAdjustedPath}`);
      const adjustedDurationCommand = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${tempAdjustedPath}"`;
      const { stdout: adjustedDurationOutput } = await execAsync(adjustedDurationCommand);
      const adjustedDuration = parseFloat(adjustedDurationOutput.trim());
      if (isNaN(adjustedDuration) || adjustedDuration <= 0) {
          throw new Error(`Invalid duration retrieved from adjusted file: ${adjustedDurationOutput.trim()}`);
      }
      console.log(`[${path.basename(outputPath, '.mp3')}] Duration after atempo: ${adjustedDuration.toFixed(3)}s, Target: ${originalDuration.toFixed(3)}s`);

      const durationDiff = originalDuration - adjustedDuration;
      console.log(`[${path.basename(outputPath, '.mp3')}] Duration difference (target - adjusted): ${durationDiff.toFixed(3)}s`);

      // Now, apply a final filter to ensure the exact duration matches the original
      // If it's too short (durationDiff > 0), use 'apad' to add silence at the end.
      // If it's too long (durationDiff < 0), use 'atrim' to cut the end.
      // If it's very close (e.g., within 0.01s), just copy or rename.
      const tolerance = 0.01; // 10 milliseconds tolerance

      if (Math.abs(durationDiff) < tolerance) {
          console.log(`[${path.basename(outputPath, '.mp3')}] Duration is within tolerance (${tolerance}s), no further adjustment needed.`);
          // Move the temporary file to the final output path
          await fs.promises.rename(tempAdjustedPath, outputPath);
          console.log(`[${path.basename(outputPath, '.mp3')}] Audio duration adjustment completed (within tolerance): ${outputPath}`);
          resolve();
          return;
      }

      let finalCommand;
      if (durationDiff > tolerance) {
          // Audio is too short, pad with silence
          console.log(`[${path.basename(outputPath, '.mp3')}] Audio is too short, padding with ${durationDiff.toFixed(3)}s of silence.`);
          finalCommand = `ffmpeg -i "${tempAdjustedPath}" -af "apad=pad_dur=${durationDiff.toFixed(3)}" -y "${outputPath}"`;
      } else if (durationDiff < -tolerance) {
          // Audio is too long, trim the end
          console.log(`[${path.basename(outputPath, '.mp3')}] Audio is too long, trimming ${Math.abs(durationDiff).toFixed(3)}s from the end.`);
          finalCommand = `ffmpeg -i "${tempAdjustedPath}" -to ${originalDuration.toFixed(3)} -c copy -y "${outputPath}"`;
          // Alternative using atrim filter: finalCommand = `ffmpeg -i "${tempAdjustedPath}" -af "atrim=end=${originalDuration.toFixed(3)}" -y "${outputPath}"`;
          // Using -to with -c copy is often faster than re-encoding with atrim.
      }

      if (finalCommand) {
          console.log(`[${path.basename(outputPath, '.mp3')}] Executing final correction command: ${finalCommand}`);
          const { stdout: finalStdout, stderr: finalStderr } = await execAsync(finalCommand);
          if (finalStderr) {
              console.warn(`[${path.basename(outputPath, '.mp3')}] FFmpeg final correction stderr (warnings/info): ${finalStderr}`);
          }
      }

      // Clean up the temporary atempo file
      try {
          await fs.promises.unlink(tempAdjustedPath);
          console.log(`[${path.basename(outputPath, '.mp3')}] Deleted temporary atempo file: ${tempAdjustedPath}`);
      } catch (unlinkErr) {
          console.error(`[${path.basename(outputPath, '.mp3')}] Error deleting temporary file:`, unlinkErr);
          // Depending on requirements, this might be a warning or an error.
          // For now, we continue even if deletion fails.
      }

      console.log(`[${path.basename(outputPath, '.mp3')}] Audio duration adjustment completed (with correction): ${outputPath}`);
      resolve(); // Resolve the promise on successful completion

    } catch (execError) {
      console.error(`[${path.basename(outputPath, '.mp3')}] FFmpeg exec Error in adjustAudioDurationWithFFmpeg:`, execError);
      if (execError.stdout) {
          console.error(`[${path.basename(outputPath, '.mp3')}] FFmpeg stdout on error:`, execError.stdout);
      }
      if (execError.stderr) {
          console.error(`[${path.basename(outputPath, '.mp3')}] FFmpeg stderr on error:`, execError.stderr);
      }
      // Attempt to clean up the temporary file if it exists in case of an error
      try {
          await fs.promises.unlink(`${outputPath}.temp_atempo.mp3`);
          console.log(`[${path.basename(outputPath, '.mp3')}] Deleted temporary atempo file on error.`);
      } catch (unlinkErr) {
          // Ignore error during cleanup on error path
      }
      reject(execError);
    }
  });
}
