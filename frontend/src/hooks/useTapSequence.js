import { useRef } from 'react';

export function useTapSequence(onAlert, action) {
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  const handleTap = (...args) => {
    const now = Date.now();
    
    if (now - lastTapTime.current > 800) {
      tapCount.current = 1;
    } else {
      tapCount.current += 1;
    }
    
    lastTapTime.current = now;

    if (tapCount.current >= 5) {
      tapCount.current = 0; // reset
      onAlert();
    }

    if (action) {
      action(...args);
    }
  };

  return { handleTap };
}
