export default function TorchButton({ onTap, isOn, isArmed }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: isOn ? '#ffffff' : '#0a0a0a',
    transition: 'background 0.3s ease',
  };

  const buttonStyle = {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    backgroundColor: isOn ? '#FFD700' : '#1c1c1e',
    border: isOn ? '3px solid #FFC200' : '3px solid #2c2c2e',
    boxShadow: isOn ? '0 0 60px 20px rgba(255,215,0,0.6)' : 'none',
    transition: 'all 0.3s ease',
    WebkitTapHighlightColor: 'transparent',
  };

  const labelStyle = {
    marginTop: '32px',
    fontSize: '16px',
    color: isOn ? '#000000' : '#ffffff',
    userSelect: 'none',
    transition: 'color 0.3s ease',
    padding: '16px', // giving it a good touch target
  };

  const subTextStyle = {
    marginTop: '8px',
    fontSize: '14px',
    color: isOn ? '#888888' : '#555555',
    userSelect: 'none',
  };

  return (
    <div style={containerStyle}>
      <div 
        style={buttonStyle} 
        onClick={onTap}
      >
        🔦
      </div>
      <div id="torch-label" style={labelStyle}>
        Torch
      </div>
      <div style={subTextStyle}>
        {isOn ? "Brightness: MAX" : "Tap to turn on"}
      </div>
    </div>
  );
}
