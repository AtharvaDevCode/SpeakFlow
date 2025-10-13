import { Upload, FileVideo, Play, Languages } from 'lucide-react'
import { useState } from 'react'

export default function UploadArea({ onFileSelect, onProcess }) {
  const [file, setFile] = useState(null)
  const [targetLang, setTargetLang] = useState('hi')
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
      onFileSelect(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files[0]) {
      setFile(files[0])
      onFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-6">
      <div 
        className={`
          glass glass-dark rounded-3xl p-8 border-2 border-dashed transition-all duration-300
          ${isDragging ? 'border-white scale-105' : 'border-gray-300'}
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="glass glass-dark rounded-full p-4">
              <Upload className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <p className="text-white mb-2">Drop your video here or click to browse</p>
          <p className="text-gray-300 text-sm mb-4">Supports MP4, MOV, AVI (Max 50MB)</p>
          
          <input 
            type="file" 
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
            id="video-upload"
          />
          <label 
            htmlFor="video-upload"
            className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 inline-flex items-center space-x-2"
          >
            <FileVideo className="h-5 w-5" />
            <span>Choose Video</span>
          </label>
        </div>
      </div>

      {file && (
        <div className="glass glass-dark rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileVideo className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-300 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="glass glass-dark rounded-2xl p-6">
        <label className="block text-white mb-3 font-medium">
          Target Language
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
            { code: 'es', name: 'Spanish', flag: '🇪🇸' },
            { code: 'fr', name: 'French', flag: '🇫🇷' },
            { code: 'de', name: 'German', flag: '🇩🇪' },
            { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
            { code: 'ko', name: 'Korean', flag: '🇰🇷' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setTargetLang(lang.code)}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                targetLang === lang.code 
                  ? 'bg-white/30 border-2 border-white/50' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-white text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onProcess && onProcess(file, targetLang)}
        disabled={!file}
        className={`
          w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2
          ${file 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105' 
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }
        `}
      >
        <Play className="h-6 w-6" />
        <span>Start Dubbing</span>
      </button>
    </div>
  )
}