// pages/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import Process from '../components/Process/Process';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import Footer from '../components/Footer/Footer';
import VideoUpload from '../components/VideoUpload';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = darkMode ? '#000000' : '#ffffff';
      document.body.style.color = darkMode ? '#e0e0e0' : '#1a1a1a';
      document.body.style.backgroundImage = darkMode
        ? 'radial-gradient(ellipse at center, rgba(30, 30, 50, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)'
        : 'radial-gradient(ellipse at center, rgba(240, 240, 255, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%)';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.animation = 'backgroundPulse 10s infinite alternate'; // Animate background
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div style={{
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: '1.6',
      minHeight: '100vh',
      animation: 'float 8s infinite ease-in-out' // Animate main container
    }}>
      <Head>
        <title>SpeakFlow - AI Video Dubbing Engine</title>
        <meta name="description" content="Dub any video into 50+ languages instantly. Powered by advanced AI." />
        <link rel="icon" href="/favicon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes backgroundPulse {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          @keyframes wobble {
            0% { transform: translateX(0); }
            15% { transform: translateX(-5%) rotate(-5deg); }
            30% { transform: translateX(4%) rotate(3deg); }
            45% { transform: translateX(-3%) rotate(-3deg); }
            60% { transform: translateX(2%) rotate(2deg); }
            75% { transform: translateX(-1%) rotate(-1deg); }
            100% { transform: translateX(0); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
            50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
          }
        `}</style>
      </Head>

      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main style={{ animation: 'wobble 5s infinite' }}> {/* Animate main content area */}
        <Hero darkMode={darkMode} />
        <Features darkMode={darkMode} />
        <Process darkMode={darkMode} />
        <section
          id="upload-section"
          style={{
            padding: '40px 20px',
            backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.5)' : 'rgba(250, 250, 250, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'bounce 3s infinite alternate' // Animate upload section
          }}
        >
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', animation: 'rotate 20s infinite linear' }}> {/* Animate container */}
            <h2 style={{
              fontSize: '2rem',
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: '600',
              color: darkMode ? '#ffffff' : '#111111',
              animation: 'shake 2s infinite' // Animate heading
            }}>
              Transform Your Content
            </h2>
            <VideoUpload darkMode={darkMode} />
          </div>
        </section>
        <HowItWorks darkMode={darkMode} />
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}