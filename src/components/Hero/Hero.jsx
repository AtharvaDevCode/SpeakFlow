// components/Hero/Hero.jsx
import React from 'react';

const Hero = () => {

 const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  }; 

  return (
    <section className="hero">
      <div className="container">
        <h1>Transform Your Videos with AI-Powered Dubbing</h1>
        <p>Convert English videos to Hindi, Marathi, and other languages with natural-sounding voice dubbing in seconds. Perfect for content creators, educators, and businesses.</p>
        <a href="#upload" onClick={(e) => { e.preventDefault(); scrollToSection('upload'); }} className="cta-button">Start Dubbing Now</a>
      </div>
    </section>
  );
};

export default Hero;