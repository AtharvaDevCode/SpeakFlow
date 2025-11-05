// pages/api/download.js
import fs from 'fs';
import path from 'path';

// IMPORTANT: Configure response limit for large file downloads
export const config = {
  api: {
    responseLimit: false, // Disable the 4MB limit for file downloads
  },
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Missing video ID' });
  }

  const tempDir = path.join(process.cwd(), 'temp_uploads');
  const outputPath = path.join(tempDir, `${id}_dubbed.mp4`);
  const metadataPath = path.join(tempDir, `${id}_metadata.json`);

  if (!fs.existsSync(metadataPath)) {
    return res.status(404).json({ message: 'Metadata not found' });
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  if (metadata.status !== 'completed') {
    return res.status(400).json({ message: 'Video not processed yet or failed' });
  }

  if (!fs.existsSync(outputPath)) {
    return res.status(404).json({ message: 'Processed video file not found' });
  }

  const stat = fs.statSync(outputPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    fs.createReadStream(outputPath, { start, end }).pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(outputPath).pipe(res);
  }
}