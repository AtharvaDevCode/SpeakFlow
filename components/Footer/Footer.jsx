// components/Footer/Footer.jsx
export default function Footer({ darkMode }) {
  const footerStyle = {
    padding: '25px 20px',
    backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderTop: `1px solid ${darkMode ? 'rgba(80, 80, 80, 0.3)' : 'rgba(200, 200, 200, 0.3)'}`,
    textAlign: 'center',
    fontFamily: 'inherit',
    animation: 'slideInUp 1s ease-out, pulse 5s infinite alternate' // Animate footer
  };

  const textStyle = {
    fontSize: '0.9rem',
    opacity: 0.75,
    margin: 0,
    color: darkMode ? '#aaaaaa' : '#666666',
    animation: 'shake 6s infinite' // Animate footer text
  };

  return (
    <footer style={footerStyle}>
      <p style={textStyle}>&copy; 2025 SpeakFlow.</p>
    </footer>
  );
}