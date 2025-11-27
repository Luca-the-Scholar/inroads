import { useState, useEffect, useCallback } from 'react';

interface WakeLockState {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function useWakeLock(): WakeLockState {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        // Re-acquire wake lock when page becomes visible again
        try {
          const newLock = await navigator.wakeLock.request('screen');
          setWakeLock(newLock);
          setIsActive(true);
        } catch (err) {
          console.warn('Failed to re-acquire wake lock:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLock]);

  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);

      lock.addEventListener('release', () => {
        setIsActive(false);
        setWakeLock(null);
      });

      return true;
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      return false;
    }
  }, [isSupported]);

  const release = useCallback(async (): Promise<void> => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsActive(false);
    }
  }, [wakeLock]);

  return { isSupported, isActive, request, release };
}
