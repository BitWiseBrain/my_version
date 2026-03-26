import { useEffect, useRef } from 'react';

export default function CheckInBar({ arm, isArmed }) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    const label = document.getElementById('torch-label');
    if (!label) return;

    const handleStart = (e) => {
      // Prevent default to avoid selection/magnifier
      timeoutRef.current = setTimeout(() => {
        arm();
        // optionally provide haptic feedback here if available
        if (navigator.vibrate) navigator.vibrate(50);
      }, 1500);
    };

    const handleEnd = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    label.addEventListener('touchstart', handleStart, { passive: true });
    label.addEventListener('touchend', handleEnd, { passive: true });
    label.addEventListener('mousedown', handleStart, { passive: true });
    label.addEventListener('mouseup', handleEnd, { passive: true });
    label.addEventListener('mouseleave', handleEnd, { passive: true });

    return () => {
      label.removeEventListener('touchstart', handleStart);
      label.removeEventListener('touchend', handleEnd);
      label.removeEventListener('mousedown', handleStart);
      label.removeEventListener('mouseup', handleEnd);
      label.removeEventListener('mouseleave', handleEnd);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [arm]);

  return isArmed ? (
    <style>{`
      @keyframes pulseAnimation {
        0% { opacity: 0.5; }
        50% { opacity: 1.0; }
        100% { opacity: 0.5; }
      }
      #torch-label {
        animation: pulseAnimation 2s infinite;
      }
    `}</style>
  ) : null;
}
