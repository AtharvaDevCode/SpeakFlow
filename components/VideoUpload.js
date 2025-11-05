// components/VideoUpload.js
import { useState } from 'react';
import axios from 'axios';

export default function VideoUpload({ darkMode }) {
  const [file, setFile] = useState(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const button = document.getElementById('file-input-button');
      if (button) {
        button.textContent = selectedFile.name.length > 20 ? selectedFile.name.substring(0, 17) + '...' : selectedFile.name;
      }
    }
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

      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });

      const { videoId } = uploadResponse.data;
      setProcessingStatus('Processing...');

      const processResponse = await axios.post('/api/process', { videoId, sourceLang, targetLang });
      setProcessingStatus(processResponse.data.status);

      if (processResponse.data.status === 'completed') {
         setDownloadUrl(`/api/download?id=${videoId}`);
         setProcessingStatus('✅ Ready to download!');
      } else {
         setProcessingStatus('❌ Processing failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      setProcessingStatus(`❌ Error: ${error.message}`);
    }
  };

  const formStyle = {
    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.6)' : 'white',
    border: darkMode
      ? `1px solid rgba(80, 80, 80, 0.2)`
      : `1px solid rgba(200, 200, 200, 0.3)`,
    borderRadius: '10px',
    padding: '30px',
    fontFamily: 'inherit',
    boxShadow: darkMode
      ? '0 4px 12px rgba(0, 0, 0, 0.1)'
      : '0 4px 12px rgba(0, 0, 0, 0.03)',
    animation: 'scaleIn 0.9s ease-out, glow 3s infinite alternate' // Animate form
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    fontSize: '0.95rem',
    animation: 'bounce 1.5s infinite alternate' // Animate labels
  };

  const selectStyle = {
    width: '100%',
    padding: '12px',
    border: `1px solid ${darkMode ? 'rgba(100, 100, 100, 0.4)' : 'rgba(150, 150, 150, 0.3)'}`,
    borderRadius: '6px',
    backgroundColor: darkMode ? 'rgba(20, 20, 20, 0.4)' : 'rgba(255, 255, 255, 0.6)',
    color: darkMode ? '#ffffff' : '#111111',
    fontSize: '0.95rem',
    marginBottom: '15px',
    boxSizing: 'border-box',
    animation: 'wobble 4s infinite' // Animate selects
  };

  const fileInputContainerStyle = {
    position: 'relative',
    marginBottom: '20px',
    width: '100%',
    animation: 'shake 5s infinite' // Animate file input container
  };

  const fileInputStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 10
  };

  const fileInputButtonStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 15px',
    border: `1px solid ${darkMode ? 'rgba(100, 100, 100, 0.4)' : 'rgba(150, 150, 150, 0.3)'}`,
    borderRadius: '6px',
    backgroundColor: darkMode ? 'rgba(20, 20, 20, 0.4)' : 'rgba(255, 255, 255, 0.6)',
    color: darkMode ? '#cccccc' : '#666666',
    fontSize: '0.95rem',
    textAlign: 'left',
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    animation: 'pulse 2s infinite alternate' // Animate file input button
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: darkMode ? '#8b5cf6' : '#7e22ce',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '10px',
    transition: 'background-color 0.2s',
    animation: 'glow 1.2s infinite alternate, bounce 0.7s infinite alternate' // Animate submit button
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: darkMode ? 'rgba(100, 100, 100, 0.4)' : 'rgba(150, 150, 150, 0.4)',
    cursor: 'not-allowed'
  };

  const statusStyle = {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    textAlign: 'center',
    backgroundColor: darkMode ? 'rgba(40, 40, 40, 0.6)' : 'rgba(240, 240, 240, 0.8)',
    border: `1px solid ${darkMode ? 'rgba(80, 80, 80, 0.2)' : 'rgba(200, 200, 200, 0.2)'}`,
    color: darkMode ? '#cccccc' : '#444444',
    animation: 'spin 12s infinite linear' // Animate status
  };

  const linkStyle = {
    display: 'inline-block',
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: darkMode ? '#a855f7' : '#8b5cf6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
    animation: 'rotate 8s infinite linear, glow 1.8s infinite alternate' // Animate download link
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={fileInputContainerStyle}>
        <label htmlFor="video" style={labelStyle}>Upload Video</label>
        <input
          type="file"
          id="video"
          accept="video/*"
          onChange={handleFileChange}
          required
          style={fileInputStyle}
        />
        <div
          id="file-input-button"
          style={fileInputButtonStyle}
          onClick={() => document.getElementById('video').click()}
        >
          {file ? (file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name) : "Choose a video file..."}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', animation: 'float 6s infinite ease-in-out' }}> {/* Animate grid container */}
        <div>
          <label htmlFor="sourceLang" style={labelStyle}>From</label>
          <select id="sourceLang" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} style={selectStyle}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
        </div>
        <div>
          <label htmlFor="targetLang" style={labelStyle}>To</label>
          <select id="targetLang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={selectStyle}>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!file || processingStatus.includes('...')}
        style={!file || processingStatus.includes('...') ? disabledButtonStyle : buttonStyle}
      >
        {processingStatus.includes('...') ? 'Processing...' : 'Dub Video'}
      </button>

      {uploadProgress > 0 && (
        <div style={statusStyle}>Progress: {uploadProgress}%</div>
      )}
      {processingStatus && <div style={statusStyle}>{processingStatus}</div>}
      {downloadUrl && (
        <a href={downloadUrl} download style={linkStyle}>Download Dubbed Video</a>
      )}
    </form>
  );
}