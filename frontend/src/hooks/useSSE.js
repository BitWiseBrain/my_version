import { useState, useEffect } from 'react';

export function useSSE() {
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/stream`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.addEventListener('alert', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLatestAlert(data);
        setAlerts((prev) => {
          const newAlerts = [data, ...prev];
          return newAlerts.slice(0, 50); // max 50
        });
      } catch (err) {
        console.error("[ANKURAH] SSE Parse Error", err);
      }
    });

    eventSource.addEventListener('heartbeat', (e) => {
      // Just to keep connection alive
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { alerts, latestAlert, connected, setAlerts };
}
