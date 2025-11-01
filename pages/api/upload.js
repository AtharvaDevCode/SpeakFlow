// pages/api/upload.js
import fs from 'fs';
import path from 'path';
import formidable from 'formidable-serverless';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('🚀 Upload API called');

  if (req.method !== 'POST') {
    console.log('❌ Method not POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'temp_uploads');
  form.keepExtensions = true;

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true });
    console.log('📁 Created temp_uploads folder');
  }

  console.log('⏳ Parsing form...');

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Form parse error:', err);
      return res.status(500).json({ message: 'Upload error' });
    }

    console.log('📄 Fields:', fields);
    console.log('📂 Raw Files object:', files); // <-- Debug log

    const videoFile = files.video;
    if (!videoFile) {
      console.log('❌ No video file found in files object');
      return res.status(400).json({ message: 'No video file provided' });
    }

    // --- CRITICAL FIX ---
    // Log the structure of the videoFile object to see what property holds the path
    console.log('📂 Video File Object:', videoFile);
    // `formidable` often stores the path in `path` or `filepath` or `file.path`
    // For `formidable-serverless`, it's usually `path`
    console.log('📂 Video File Path (videoFile.path):', videoFile.path);
    console.log('📂 Video File Path (videoFile.filepath):', videoFile.filepath);

    // Use the correct property - likely `path` for formidable-serverless
    const originalPath = videoFile.path; // <-- Changed from videoFile.filepath

    if (!originalPath) {
       console.log('❌ Original path is undefined or empty:', { path: videoFile.path, filepath: videoFile.filepath });
       return res.status(500).json({ message: 'File path error' });
    }

    // --- END FIX ---

    const videoId = uuidv4();
    // Extract file extension from original name
    const fileExtension = path.extname(videoFile.name || videoFile.originalFilename || '').toLowerCase();
    const newPath = path.join(form.uploadDir, `${videoId}${fileExtension}`);

    try {
      console.log(`⏳ Renaming file: ${originalPath} -> ${newPath}`);
      await fs.promises.rename(originalPath, newPath);
      console.log('✅ File renamed successfully');

      const metadata = {
        id: videoId,
        originalName: videoFile.originalFilename || videoFile.name,
        size: videoFile.size,
        sourceLang: fields.sourceLang || 'en',
        targetLang: fields.targetLang || 'es',
        status: 'uploaded',
        path: newPath,
        timestamp: new Date().toISOString()
      };

      const metadataPath = path.join(form.uploadDir, `${videoId}_metadata.json`);
      await fs.promises.writeFile(metadataPath, JSON.stringify(metadata));
      console.log('✅ Metadata written');

      res.status(200).json({ message: 'Upload successful', videoId });

    } catch (error) {
      console.error('❌ Error moving file or writing metadata:', error);
      // Attempt to clean up if rename failed
      if (originalPath && fs.existsSync(originalPath)) {
        try {
          await fs.promises.unlink(originalPath);
        } catch (unlinkError) {
          console.error('Failed to clean up temporary file:', unlinkError);
        }
      }
      res.status(500).json({ message: 'Processing error', error: error.message });
    }
  });
}