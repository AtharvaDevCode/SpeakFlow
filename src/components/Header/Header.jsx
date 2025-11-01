// components/Header/Header.jsx
import React from 'react';

const Header = ({ darkMode, toggleDarkMode }) => {
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
    <header>
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <i className="fas fa-microphone-alt"></i>
            <span>SpeakFlow</span>
          </div>
          <div className="nav-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}>How It Works</a>
            <a href="#upload" onClick={(e) => { e.preventDefault(); scrollToSection('upload'); }}>Dub Now</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Testimonials</a>
          </div>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;