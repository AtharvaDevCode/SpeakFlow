// components/HowItWorks/HowItWorks.jsx
export default function HowItWorks({ darkMode }) {
  const sectionStyle = {
    padding: '60px 20px',
    backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.5)' : 'rgba(250, 250, 250, 0.5)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    textAlign: 'center',
    fontFamily: 'inherit',
    animation: 'slideInLeft 1.8s ease-out' // Animate section
  };

  const headingStyle = {
    fontSize: '2rem',
    marginBottom: '15px',
    fontWeight: '600',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    animation: 'shake 2.5s infinite' // Animate heading
  };

  const textStyle = {
    fontSize: '1.05rem',
    maxWidth: '700px',
    margin: '0 auto 25px',
    opacity: 0.9,
    color: darkMode ? '#d0d0d0' : '#333333',
    lineHeight: '1.6',
    animation: 'fadeInUp 1.2s ease-out' // Animate text
  };

  const techListStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    maxWidth: '600px',
    margin: '0 auto',
    animation: 'float 4s infinite ease-in-out' // Animate tech list
  };

  const techItemStyle = {
    padding: '6px 12px',
    backgroundColor: darkMode ? 'rgba(50, 50, 50, 0.5)' : 'rgba(200, 200, 200, 0.3)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: darkMode ? '#cccccc' : '#555555',
    animation: 'pulse 1.8s infinite alternate' // Animate tech items
  };

  return (
    <section style={sectionStyle}>
      <h2 style={headingStyle}>The Technology</h2>
      <p style={textStyle}>
        Our system uses advanced machine learning models to analyze speech, translate content, and generate natural-sounding audio that matches the original speaker's tone and rhythm.
      </p>
      <div style={techListStyle}>
        <span style={techItemStyle}>Neural Networks</span>
        <span style={techItemStyle}>TTS Synthesis</span>
        <span style={techItemStyle}>Lip Sync</span>
        <span style={techItemStyle}>Real-time Processing</span>
      </div>
    </section>
  );
}