// components/Header/Header.jsx
export default function Header({ darkMode, toggleDarkMode }) {
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${darkMode ? 'rgba(80, 80, 80, 0.3)' : 'rgba(200, 200, 200, 0.3)'}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    fontFamily: 'inherit',
    animation: 'pulse 4s infinite' // Animate header
  };

  const logoStyle = {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: darkMode ? '#d0bfff' : '#7e22ce',
    margin: 0,
    animation: 'spin 15s infinite linear' // Animate logo
  };

  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(240, 240, 240, 0.5)',
    border: `1px solid ${darkMode ? 'rgba(80, 80, 80, 0.3)' : 'rgba(200, 200, 200, 0.3)'}`,
    borderRadius: '20px',
    padding: '2px',
    cursor: 'pointer',
    width: '60px',
    height: '32px',
    transition: 'background-color 0.3s',
    animation: 'glow 2s infinite alternate' // Animate toggle container
  };

  const toggleButtonStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: darkMode ? '#d0bfff' : '#7e22ce',
    transition: 'transform 0.3s',
    transform: darkMode ? 'translateX(28px)' : 'translateX(0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    color: darkMode ? '#000000' : '#ffffff',
    animation: 'bounce 1s infinite alternate' // Animate toggle button
  };

  return (
    <header style={headerStyle}>
      <h1 style={logoStyle}>SpeakFlow</h1>
      <div onClick={toggleDarkMode} style={toggleContainerStyle}>
        <div style={toggleButtonStyle}>
          {darkMode ? '☀️' : '🌙'}
        </div>
      </div>
    </header>
  );
}