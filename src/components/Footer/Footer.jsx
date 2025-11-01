// components/Footer.js
import React from 'react';

const Footer = () => {

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>DubMaster</h3>
            <p>AI-powered video dubbing solution for global content distribution.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} >Home</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} >Features</a></li>
              <li><a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }} >How It Works</a></li>
              <li><a href="#upload" onClick={(e) => { e.preventDefault(); scrollToSection('upload'); }} >Dub Now</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Supported Languages</h3>
            <ul className="footer-links">
              <li><a href="#">Hindi</a></li>
              <li><a href="#">Marathi</a></li>
              <li><a href="#">Tamil</a></li>
              <li><a href="#">Telugu</a></li>
              <li><a href="#">Bengali</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="footer-links">
              <li><i className="fas fa-envelope"></i> support@DubMaster.com</li>
              <li><i className="fas fa-phone"></i> +91 98765 43210</li>
              <li><i className="fas fa-map-marker-alt"></i> Mumbai, India</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; 2023 DubMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;