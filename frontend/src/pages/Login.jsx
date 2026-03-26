import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    localStorage.setItem("ankurah_role", role);
    if (role === "police") {
      navigate("/dashboard");
    } else {
      navigate("/torch");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glowStyle}></div>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={logoStyle}>🛡️ ANKURAH</h1>
          <div style={badgeStyle}>SECURED</div>
        </div>
        
        <p style={taglineStyle}>AI-POWERED SILENT SAFETY PROTOCOL</p>
        
        <div style={buttonGroupStyle}>
          <button 
            style={victimBtnStyle}
            onClick={() => handleRoleSelection("victim")}
          >
            <span style={iconStyle}>🔦</span>
            <div style={btnTextContainer}>
              <span style={btnTitle}>OPEN APPLICATION</span>
              <span style={btnSub}>Mobile Stealth Mode</span>
            </div>
          </button>
          
          <button 
            style={policeBtnStyle}
            onClick={() => handleRoleSelection("police")}
          >
            <span style={iconStyle}>🛰️</span>
            <div style={btnTextContainer}>
              <span style={btnTitle}>COMMAND CENTER</span>
              <span style={btnSub}>Emergency Response Unit</span>
            </div>
          </button>
        </div>
        
        <div style={footerStyle}>
          <div style={statusDot}></div>
          <span>SYSTEM ONLINE: BENGALURU NODE-04</span>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  backgroundColor: "#05070a",
  height: "100vh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Inter', sans-serif",
  overflow: "hidden",
  position: "relative"
};

const glowStyle = {
  position: "absolute",
  width: "400px",
  height: "400px",
  backgroundColor: "#1e3a8a",
  filter: "blur(120px)",
  opacity: 0.2,
  borderRadius: "50%"
};

const cardStyle = {
  backgroundColor: "rgba(17, 25, 40, 0.75)",
  backdropFilter: "blur(12px)",
  padding: "48px",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  textAlign: "center",
  width: "100%",
  maxWidth: "440px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  zIndex: 10
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  marginBottom: "8px"
};

const logoStyle = {
  fontSize: "36px",
  color: "#f8fafc",
  letterSpacing: "4px",
  margin: 0,
  fontWeight: "800"
};

const badgeStyle = {
  fontSize: "10px",
  backgroundColor: "#1e40af",
  color: "#93c5fd",
  padding: "2px 8px",
  borderRadius: "4px",
  fontWeight: "bold",
  letterSpacing: "1px"
};

const taglineStyle = {
  fontSize: "12px",
  color: "#64748b",
  marginBottom: "48px",
  letterSpacing: "2.5px"
};

const buttonGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const btnTextContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start"
};

const btnTitle = {
  fontSize: "16px",
  fontWeight: "700",
  letterSpacing: "0.5px"
};

const btnSub = {
  fontSize: "10px",
  opacity: 0.6,
  fontWeight: "400"
};

const iconStyle = {
  fontSize: "24px",
  backgroundColor: "rgba(255,255,255,0.05)",
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px"
};

const victimBtnStyle = {
  backgroundColor: "#1e293b",
  color: "#f8fafc",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "16px 24px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "left"
};

const policeBtnStyle = {
  backgroundColor: "#1e40af",
  color: "#ffffff",
  border: "none",
  padding: "16px 24px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "left",
  boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)"
};

const footerStyle = {
  marginTop: "48px",
  fontSize: "11px",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  letterSpacing: "0.5px"
};

const statusDot = {
  width: "8px",
  height: "8px",
  backgroundColor: "#22c55e",
  borderRadius: "50%",
  boxShadow: "0 0 8px #22c55e"
};
