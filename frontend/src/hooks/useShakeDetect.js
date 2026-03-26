import { useEffect } from 'react';

export function useShakeDetect(onAlert) {
  useEffect(() => {
    let shakeCounts = 0;
    let lastShakeTime = 0;
    const SHAKE_WINDOW = 2000;
    const THRESHOLD = 25;

    const handleMotion = (event) => {
      const { x, y, z } = event.accelerationIncludingGravity || event.acceleration;
      if (x === null || y === null || z === null) return;

      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime > SHAKE_WINDOW) {
          shakeCounts = 1;
        } else {
          shakeCounts += 1;
        }
        lastShakeTime = now;

        if (shakeCounts >= 3) {
          shakeCounts = 0;
          onAlert();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [onAlert]);

  const requestPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        await DeviceMotionEvent.requestPermission();
      } catch (err) {
        console.error("[ANKURAH] Shake permission denied", err);
      }
    }
  };

  return { requestPermission };
}
