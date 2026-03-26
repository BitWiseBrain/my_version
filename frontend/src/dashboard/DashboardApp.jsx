import { useState, useEffect } from 'react';
import Header from './Header';
import ThreatBanner from './ThreatBanner';
import CameraGrid from './CameraGrid';
import AlertMap from './AlertMap';
import AlertLog from './AlertLog';
import { useSSE } from '../hooks/useSSE';
import { CAMERAS } from '../constants/cameras';

export default function DashboardApp() {
  const { alerts, latestAlert, connected, setAlerts } = useSSE();
  const [cameras, setCameras] = useState(CAMERAS);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Safe Fetch for Cameras
    fetch(`${backendUrl}/api/cameras`)
      .then(res => {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setCameras(data);
      })
      .catch((err) => {
        console.warn("[ANKURAH] Using fallback cameras", err);
      });

    // Safe Fetch for Initial Alerts
    fetch(`${backendUrl}/api/alerts`)
      .then(res => {
        if (!res.ok) throw new Error("Status " + res.status);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Received non-JSON response");
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAlerts(data);
        } else {
          console.warn("[ANKURAH] Initial alerts is not an array", data);
          setAlerts([]);
        }
      })
      .catch(err => {
        console.error("[ANKURAH] Hydration failed", err);
        setAlerts([]);
      });
  }, [setAlerts]);

  return (
    <div style={{ backgroundColor: '#05070a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f8fafc' }}>
      <Header connected={connected} />
      <ThreatBanner latestAlert={latestAlert} />
      
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section>
          <CameraGrid cameras={cameras} latestAlert={latestAlert} />
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3fr)', gap: '32px' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <AlertMap alerts={alerts || []} />
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <AlertLog alerts={alerts || []} />
          </div>
        </section>
      </main>
    </div>
  );
}
