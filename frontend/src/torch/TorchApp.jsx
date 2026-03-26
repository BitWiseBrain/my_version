import { useState, useCallback, useRef, useEffect } from 'react';
import { useShakeDetect } from '../hooks/useShakeDetect';
import { useTapSequence } from '../hooks/useTapSequence';
import { useDeadMansSwitch } from '../hooks/useDeadMansSwitch';
import { useGeolocation } from '../hooks/useGeolocation';
import { fireAlert } from './SilentAlert';
import TorchButton from './TorchButton';
import CheckInBar from './CheckInBar';

export default function TorchApp() {
  const [isOn, setIsOn] = useState(false);
  const wakeLockRef = useRef(null);
  const lastAlertTime = useRef(0);

  const { getLocation } = useGeolocation();

  const handleAlert = useCallback(async () => {
    const now = Date.now();
    if (now - lastAlertTime.current < 30000) {
      return; // 30s cooldown shared by all
    }
    lastAlertTime.current = now;
    const coords = await getLocation();
    fireAlert(coords);
  }, [getLocation]);

  const { requestPermission } = useShakeDetect(handleAlert);
  const { isArmed, arm } = useDeadMansSwitch(handleAlert);

  const toggleTorch = useCallback(async () => {
    const newState = !isOn;
    setIsOn(newState);
    
    // First tap ever on iOS asks for permission
    requestPermission();

    try {
      if (newState && 'wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } else if (!newState && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (err) {
      // Handle browsers that don't support wake lock silently
    }
  }, [isOn, requestPermission]);

  const { handleTap } = useTapSequence(handleAlert, toggleTorch);

  // Clean up wake lock on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflow: 'hidden' }}>
      <CheckInBar arm={arm} isArmed={isArmed} />
      <TorchButton onTap={handleTap} isOn={isOn} isArmed={isArmed} />
    </div>
  );
}
