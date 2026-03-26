import { useState, useEffect, useCallback } from 'react';

export function useDeadMansSwitch(onAlert) {
  const [isArmed, setIsArmed] = useState(
    () => sessionStorage.getItem('ankurah_armed') === 'true'
  );
  
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const saved = sessionStorage.getItem('ankurah_time_remaining');
    return saved ? parseInt(saved, 10) : parseInt(import.meta.env.VITE_CHECKIN_INTERVAL_MS || "900000", 10);
  });

  const arm = useCallback(() => {
    setIsArmed(true);
    sessionStorage.setItem('ankurah_armed', 'true');
    setTimeRemaining(parseInt(import.meta.env.VITE_CHECKIN_INTERVAL_MS || "900000", 10));
    sessionStorage.setItem('ankurah_time_remaining', import.meta.env.VITE_CHECKIN_INTERVAL_MS || "900000");
  }, []);

  const disarm = useCallback(() => {
    setIsArmed(false);
    sessionStorage.setItem('ankurah_armed', 'false');
    const defaultTime = parseInt(import.meta.env.VITE_CHECKIN_INTERVAL_MS || "900000", 10);
    setTimeRemaining(defaultTime);
    sessionStorage.setItem('ankurah_time_remaining', defaultTime.toString());
  }, []);

  const checkIn = useCallback(() => {
    if (isArmed) {
      const defaultTime = parseInt(import.meta.env.VITE_CHECKIN_INTERVAL_MS || "900000", 10);
      setTimeRemaining(defaultTime);
      sessionStorage.setItem('ankurah_time_remaining', defaultTime.toString());
    }
  }, [isArmed]);

  useEffect(() => {
    if (!isArmed) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(interval);
          disarm();
          onAlert();
          return 0;
        }
        sessionStorage.setItem('ankurah_time_remaining', next.toString());
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isArmed, onAlert, disarm]);

  return { isArmed, timeRemaining, arm, disarm, checkIn };
}
