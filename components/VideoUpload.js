// components/VideoUpload.js
import { useState } from 'react';
import axios from 'axios';

export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);
    formData.append('sourceLang', sourceLang);
    formData.append('targetLang', targetLang);

    try {
      setProcessingStatus('Uploading...');
      setUploadProgress(0);

      // Upload video
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const { videoId } = uploadResponse.data;
      setProcessingStatus('Processing...');

      // Start processing
      const processResponse = await axios.post('/api/process', { videoId, sourceLang, targetLang });
      setProcessingStatus(processResponse.data.status);

      if (processResponse.data.status === 'completed') {
         setDownloadUrl(`/api/download?id=${videoId}`);
         setProcessingStatus('Completed! Download ready.');
      } else {
         setProcessingStatus('Processing failed or still in progress. Check status.');
      }

    } catch (error) {
      console.error('Upload/Process Error:', error);
      setProcessingStatus(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="video">Select Video:</label>
        <input
          type="file"
          id="video"
          accept="video/*"
          onChange={handleFileChange}
          required
        />
      </div>
      <div>
        <label htmlFor="sourceLang">Source Language:</label>
        <select id="sourceLang" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="hi">Hindi</option>
          {/* Add more options */}
        </select>
      </div>
      <div>
        <label htmlFor="targetLang">Target Language:</label>
        <select id="targetLang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="hi">Hindi</option>
          <option value="en">English</option>
          {/* Add more options, ensure it's different from source */}
        </select>
      </div>
      <button type="submit" disabled={!file || processingStatus.includes('...')}>
        Dub Video
      </button>
      {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
      {processingStatus && <p>Status: {processingStatus}</p>}
      {downloadUrl && (
        <div>
          <a href={downloadUrl} download>Download Dubbed Video</a>
        </div>
      )}
    </form>
  );
}