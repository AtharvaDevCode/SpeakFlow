// components/UploadSection/UploadSection.jsx
import React, { useState } from 'react';

const UploadSection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
  };

  const handleFiles = (files) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file (MP4, MOV, AVI, MKV)');
        return;
      }
      
      // Validate file size (max 1GB)
      if (file.size > 1024 * 1024 * 1024) {
        setError('File size exceeds 1GB limit');
        return;
      }
      
      // Validate file extension
      const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        setError('Unsupported file format. Please use MP4, MOV, AVI, or MKV');
        return;
      }
      
      setVideoFile(file);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    handleFiles(e.target.files);
  };

  const handleDubClick = () => {
    if (!videoFile) {
      setError('Please select a video file first');
      return;
    }
    
    setIsProcessing(true);
    setProcessingComplete(false);
    setError('');
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingComplete(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setProcessingComplete(false);
        setVideoFile(null);
      }, 3000);
    }, 2000);
  };

  return (
    <section className="section upload-section" id="upload">
      <div className="container">
        <div className="section-title">
          <h2>Dub Your Video Now</h2>
          <p>Upload your English video and select target language to start dubbing</p>
        </div>
        <div className="upload-container">
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
          >
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text">
              <h3>Drag & Drop Your Video</h3>
              <p>or click to browse files</p>
              <p>Supported formats: MP4, MOV, AVI, MKV (Max 1GB)</p>
            </div>
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleChange} 
              accept="video/*"
            />
          </div>
          
          {videoFile && (
            <div className="file-info">
              <div className="file-preview">
                <i className="fas fa-file-video"></i>
                <span>{videoFile.name}</span>
                <span className="file-size">
                  ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="language-selector">
            <button 
              className={`language-btn ${selectedLanguage === 'hindi' ? 'active' : ''}`} 
              onClick={() => handleLanguageChange('hindi')}
            >
              Hindi
            </button>
            <button 
              className={`language-btn ${selectedLanguage === 'marathi' ? 'active' : ''}`} 
              onClick={() => handleLanguageChange('marathi')}
            >
              Marathi
            </button>
            <button 
              className={`language-btn ${selectedLanguage === 'tamil' ? 'active' : ''}`} 
              onClick={() => handleLanguageChange('tamil')}
            >
              Tamil
            </button>
            <button 
              className={`language-btn ${selectedLanguage === 'telugu' ? 'active' : ''}`} 
              onClick={() => handleLanguageChange('telugu')}
            >
              Telugu
            </button>
          </div>
          
          <button 
            className="cta-button" 
            onClick={handleDubClick}
            disabled={isProcessing}
          >
            <i className={isProcessing ? "fas fa-spinner fa-spin" : processingComplete ? "fas fa-check" : "fas fa-microphone-alt"}></i>
            {isProcessing ? " Dubbing..." : processingComplete ? " Dubbing Complete!" : " Dub Video Now"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;