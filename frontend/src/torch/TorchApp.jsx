import { useState, useCallback, useRef, useEffect } from "react";
import { fireAlert } from "./SilentAlert";

// Mock Geolocation for the hackathon context
const getMockLocation = () => ({
  lat: 12.9716 + (Math.random() - 0.5) * 0.01, // Near Bengaluru
  lng: 77.5946 + (Math.random() - 0.5) * 0.01
});

export default function TorchApp() {
  const [isOn, setIsOn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const longPressTimer = useRef(null);
  const cooldownRef = useRef(false);

  // 1. Silent Alert UX (Feedback)
  const provideSilentFeedback = () => {
    // Simulate haptic feedback if available (stealthy)
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    // Tiny, non-obvious toast for the demo judges to know it worked
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 2. Hidden Distress Trigger logic
  const triggerDistress = useCallback(async () => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => (cooldownRef.current = false), 30000); // 30s SOS cooldown

    const coords = getMockLocation(); // Real world: geolocation.getCurrentPosition
    fireAlert(coords, "stealth-long-press");
    provideSilentFeedback();
  }, []);

  // 3. Handlers for the "Flashlight" long press
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      triggerDistress();
    }, 2500); // 2.5s long press for stealth trigger
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const toggleTorch = () => {
    setIsOn((prev) => !prev);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      style={{
        backgroundColor: isOn ? "#ffffff" : "#0d0d0d",
        color: isOn ? "#000000" : "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        userSelect: "none",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Subtle "Light" indicator for the torch toggle */}
      <h2 style={{ fontSize: "14px", fontWeight: "300", letterSpacing: "2px", position: "absolute", top: "40px", opacity: 0.6 }}>
        FLASHLITE PRO
      </h2>

      {/* Main Torch Toggle - The "Normal" app feature */}
      <div 
        onClick={toggleTorch}
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          backgroundColor: isOn ? "#FFD700" : "#2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "60px",
          boxShadow: isOn 
            ? "0 0 80px 20px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(255,255,255,0.5)" 
            : "0 5px 15px rgba(0,0,0,0.3)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        {isOn ? "🔆" : "🌑"}
      </div>

      <p style={{ marginTop: "40px", fontSize: "12px", color: isOn ? "#555" : "#777", fontWeight: "600", letterSpacing: "1px" }}>
        {isOn ? "BRIGHTNESS: MAX" : "TAP TO TURN ON"}
      </p>

      {/* Decorative Mock Settings for Realism */}
      <div style={{ position: "absolute", bottom: "100px", width: "100%", textAlign: "center", padding: "0 40px" }}>
        <div style={{ height: "4px", backgroundColor: isOn ? "#eee" : "#222", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: "85%", height: "100%", backgroundColor: isOn ? "#FFD700" : "#444" }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "9px", opacity: 0.5 }}>
          <span>BATTERY: 85%</span>
          <span>LED: 5500K</span>
        </div>
      </div>

      {/* Silent Feedback Toast - ONLY for hackathon judges to verify the alert sent */}
      {showToast && (
        <div style={{
          position: "fixed",
          bottom: "40px",
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "20px",
          fontSize: "10px",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "fadeInOut 2s ease forwards",
          zIndex: 1000
        }}>
          System: Ready
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
