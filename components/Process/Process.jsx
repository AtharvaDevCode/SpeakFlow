// components/Process/Process.jsx
export default function Process({ darkMode }) {
  const processStyle = {
    padding: '60px 20px',
    backgroundColor: darkMode ? 'rgba(5, 5, 5, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    textAlign: 'center',
    fontFamily: 'inherit',
    animation: 'slideInRight 1.5s ease-out' // Animate process section
  };

  const headingStyle = {
    fontSize: '2rem',
    marginBottom: '40px',
    fontWeight: '600',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    animation: 'rotate 10s infinite linear' // Animate heading
  };

  const stepsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto',
    animation: 'float 5s infinite ease-in-out' // Animate steps container
  };

  const stepStyle = {
    flex: '1',
    minWidth: '180px',
    padding: '20px',
    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.5)' : 'white',
    border: darkMode
      ? `1px solid rgba(80, 80, 80, 0.2)`
      : `1px solid rgba(200, 200, 200, 0.3)`,
    borderRadius: '10px',
    boxShadow: darkMode
      ? '0 4px 12px rgba(0, 0, 0, 0.1)'
      : '0 4px 12px rgba(0, 0, 0, 0.03)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'scaleIn 0.6s ease-out, glow 2.5s infinite alternate' // Animate steps
  };

  const stepNumberStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '10px',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    animation: 'spin 8s infinite linear' // Animate step numbers
  };

  const stepTitleStyle = {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: darkMode ? '#ffffff' : '#111111',
    animation: 'pulse 2s infinite alternate' // Animate step titles
  };

  const stepDescStyle = {
    fontSize: '0.9rem',
    opacity: 0.85,
    color: darkMode ? '#cccccc' : '#444444',
    animation: 'wobble 3s infinite' // Animate step descriptions
  };

  const steps = [
    { title: "Upload", desc: "Select your video file" },
    { title: "Choose", desc: "Pick source/target languages" },
    { title: "Process", desc: "AI generates dubbed version" },
    { title: "Download", desc: "Get your finished video" }
  ];

  return (
    <section style={processStyle}>
      <h2 style={headingStyle}>How It Works</h2>
      <div style={stepsStyle}>
        {steps.map((step, i) => (
          <div key={i} style={stepStyle}>
            <div style={stepNumberStyle}>{i + 1}</div>
            <h3 style={stepTitleStyle}>{step.title}</h3>
            <p style={stepDescStyle}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}