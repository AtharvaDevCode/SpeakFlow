'use client'

import { useState } from 'react'
import GlassCard from './components/GlassCard'
import UploadArea from './components/UploadArea'
import { Languages, Sparkles, Zap, Globe } from 'lucide-react'

export default function Home() {
  const [currentView, setCurrentView] = useState('upload') // 'upload', 'processing', 'completed'

  const handleFileSelect = (file) => {
    console.log('File selected:', file.name)
  }

  const handleProcess = (file, targetLang) => {
    if (!file) return
    setCurrentView('processing')
    // Simulate processing
    setTimeout(() => {
      setCurrentView('completed')
    }, 3000)
  }

  const resetProcess = () => {
    setCurrentView('upload')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DubFlow
          </h1>
          <p className="text-xl text-gray-300 mb-8">AI-Powered Video Dubbing Made Simple</p>
          
          <div className="flex justify-center space-x-8 text-white">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Multi-Language</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Natural Voices</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <GlassCard className="p-0">
          {currentView === 'upload' && (
            <div className="p-8">
              <UploadArea 
                onFileSelect={handleFileSelect}
                onProcess={handleProcess}
              />
            </div>
          )}

          {currentView === 'processing' && (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="glass glass-dark rounded-full p-6 animate-spin">
                  <Zap className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Processing Your Video</h2>
              <p className="text-gray-300 mb-8">Converting to {getLanguageName('hi')}...</p>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="text-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    1
                  </div>
                  <div>Extracting Audio</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    2
                  </div>
                  <div>Translating</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    3
                  </div>
                  <div>Generating Speech</div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'completed' && (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="glass glass-dark rounded-full p-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Dubbing Complete!</h2>
              <p className="text-gray-300 mb-8">Your video has been successfully dubbed.</p>
              
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl transition-all duration-300">
                  Download Dubbed Video
                </button>
                <button 
                  onClick={resetProcess}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all duration-300"
                >
                  Process Another Video
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <GlassCard className="p-6 text-center">
            <Languages className="h-8 w-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Multi-Language</h3>
            <p className="text-gray-300 text-sm">Support for 50+ languages with natural pronunciation</p>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <Zap className="h-8 w-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Fast Processing</h3>
            <p className="text-gray-300 text-sm">AI-powered pipeline delivers results in minutes</p>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Natural Voices</h3>
            <p className="text-gray-300 text-sm">Human-like voice synthesis with emotional tone</p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function getLanguageName(code) {
  const languages = {
    'hi': 'Hindi',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean'
  }
  return languages[code] || code
}