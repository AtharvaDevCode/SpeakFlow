// components/Features/Features.jsx
export default function Features({ darkMode }) {
  const featuresStyle = {
    padding: '60px 20px',
    backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.5)' : 'rgba(250, 250, 250, 0.5)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    fontFamily: 'inherit',
    animation: 'slideInLeft 1.5s ease-out' // Animate features section
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    padding: '0 20px',
    animation: 'wobble 6s infinite' // Animate container
  };

  const featureStyle = {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.4)' : 'white',
    border: darkMode
      ? `1px solid rgba(80, 80, 80, 0.2)`
      : `1px solid rgba(200, 200, 200, 0.3)`,
    borderRadius: '10px',
    boxShadow: darkMode
      ? '0 4px 12px rgba(0, 0, 0, 0.1)'
      : '0 4px 12px rgba(0, 0, 0, 0.03)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    animation: 'fadeInUp 0.7s ease-out, pulse 3s infinite alternate' // Animate feature cards
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    animation: 'bounce 1.2s infinite alternate' // Animate titles
  };

  const descStyle = {
    fontSize: '0.95rem',
    opacity: 0.85,
    color: darkMode ? '#cccccc' : '#444444',
    animation: 'shake 4s infinite' // Animate descriptions
  };

  const featuresList = [
    {
      title: "50+ Languages",
      desc: "Dub into major global languages with native-like fluency."
    },
    {
      title: "Perfect Timing",
      desc: "Lip-sync and audio timing preserved for a natural feel."
    },
    {
      title: "No Training",
      desc: "Instant results. No model training or setup required."
    },
    {
      title: "Batch Processing",
      desc: "Upload and dub multiple videos at once."
    }
  ];

  return (
    <section style={featuresStyle}>
      <div style={containerStyle}>
        {featuresList.map((f, i) => (
          <div key={i} style={featureStyle}>
            <h3 style={titleStyle}>{f.title}</h3>
            <p style={descStyle}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}