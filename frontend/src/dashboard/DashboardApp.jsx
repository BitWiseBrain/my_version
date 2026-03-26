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
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    // Try to fetch cameras, fallback to constants
    fetch(`${import.meta.env.VITE_BACKEND_URL}/cameras`)
      .then(res => res.json())
      .then(data => setCameras(data))
      .catch((err) => {
        console.warn("[ANKURAH] Failed to fetch cameras, using fallback constants", err);
        setCameras(CAMERAS);
      });

    // Try to hydrate initial alerts
    fetch(`${import.meta.env.VITE_BACKEND_URL}/alerts`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch(err => console.warn("[ANKURAH] Failed to hydrate alerts", err));
  }, [setAlerts]);

  return (
    <div style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Header connected={connected} />
      <ThreatBanner latestAlert={latestAlert} />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <CameraGrid cameras={cameras} latestAlert={latestAlert} />
        </section>

        <section>
          <AlertMap alerts={alerts} />
        </section>

        <section>
          <AlertLog alerts={alerts} />
        </section>
      </main>
    </div>
  );
}
