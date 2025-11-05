// components/Hero/Hero.jsx
export default function Hero({ darkMode }) {
  const heroStyle = {
    padding: '100px 20px 80px',
    textAlign: 'center',
    background: darkMode
      ? 'radial-gradient(circle, rgba(20,20,30,0.8) 0%, rgba(0,0,0,0.9) 100%), linear-gradient(135deg, #0f0f1a 0%, #000000 100%)'
      : 'radial-gradient(circle, rgba(240, 240, 255, 0.5) 0%, rgba(230, 230, 255, 0.7) 100%), linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)',
    color: darkMode ? '#ffffff' : '#111111',
    fontFamily: 'inherit',
    position: 'relative',
    overflow: 'hidden',
    animation: 'slideInLeft 1s ease-out, float 6s infinite ease-in-out' // Animate hero section
  };

  const headingStyle = {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    lineHeight: '1.1',
    textShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.05)',
    color: darkMode ? '#d0bfff' : '#6b46c1',
    animation: 'fadeInUp 1s ease-out, bounce 2s infinite alternate' // Animate heading
  };

  const subheadingStyle = {
    fontSize: '1.4rem',
    opacity: 0.9,
    maxWidth: '700px',
    margin: '0 auto 25px',
    lineHeight: '1.5',
    animation: 'slideInRight 1.2s ease-out' // Animate subheading
  };

  const statsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    flexWrap: 'wrap',
    marginBottom: '30px',
    animation: 'wobble 4s infinite' // Animate stats container
  };

  const statBoxStyle = {
    textAlign: 'center',
    animation: 'scaleIn 0.8s ease-out' // Animate stat boxes individually
  };

  const statNumberStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    animation: 'pulse 1.5s infinite alternate' // Animate stat numbers
  };

  const statLabelStyle = {
    fontSize: '0.9rem',
    opacity: 0.8,
    color: darkMode ? '#cccccc' : '#444444',
    animation: 'shake 3s infinite' // Animate stat labels
  };

  const ctaButtonStyle = {
    padding: '14px 30px',
    backgroundColor: darkMode ? '#8b5cf6' : '#7e22ce',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1.05rem',
    display: 'inline-block',
    transition: 'background-color 0.2s',
    animation: 'glow 1.5s infinite alternate, bounce 0.8s infinite alternate' // Animate CTA button
  };

  return (
    <section style={heroStyle}>
      <h1 style={headingStyle}>AI Video Dubbing, Instantly</h1>
      <p style={subheadingStyle}>
        Upload any video. Choose a language. Get a perfectly dubbed version in minutes.
      </p>

      <div style={statsContainerStyle}>
        <div style={statBoxStyle}>
          <div style={statNumberStyle}>50+</div>
          <div style={statLabelStyle}>Languages</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statNumberStyle}>80%</div>
          <div style={statLabelStyle}>Faster</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statNumberStyle}>99%</div>
          <div style={statLabelStyle}>Accuracy</div>
        </div>
      </div>

      <a href="#upload-section" style={ctaButtonStyle}>Try It Now</a>
    </section>
  );
}