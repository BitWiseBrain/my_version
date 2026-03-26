import { useState, useEffect } from 'react';

export default function ThreatBanner({ latestAlert }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!latestAlert) {
      setVisible(false);
      return;
    }

    const age = Date.now() - new Date(latestAlert.timestamp).getTime();
    if (age < 8000) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 8000 - age);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [latestAlert]);

  if (!visible || !latestAlert) return null;

  return (
    <>
      <style>{`
        @keyframes bannerPulse {
          0% { opacity: 0.8; }
          50% { opacity: 1.0; }
          100% { opacity: 0.8; }
        }
      `}</style>
      <div style={{
        backgroundColor: '#DC2626',
        color: 'white',
        width: '100%',
        padding: '16px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '18px',
        animation: 'bannerPulse 1s infinite'
      }}>
        🚨 DISTRESS SIGNAL — {latestAlert.location_name} | {latestAlert.camera_id}
      </div>
    </>
  );
}
