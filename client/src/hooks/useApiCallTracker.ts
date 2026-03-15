import { useRef, useEffect } from 'react';

interface ApiCallTracker {
  [key: string]: {
    count: number;
    lastCall: number;
    isActive: boolean;
  };
}

const apiCallTracker: ApiCallTracker = {};

export const useApiCallTracker = (apiName: string, isEnabled: boolean = true) => {
  const callCountRef = useRef(0);
  const lastCallTimeRef = useRef(0);

  useEffect(() => {
    if (!isEnabled) return;

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    // Initialize tracker for this API if it doesn't exist
    if (!apiCallTracker[apiName]) {
      apiCallTracker[apiName] = {
        count: 0,
        lastCall: 0,
        isActive: false
      };
    }

    const tracker = apiCallTracker[apiName];

    // Prevent rapid successive calls (within 100ms)
    if (timeSinceLastCall < 100 && tracker.isActive) {
      console.warn(`🚫 [API CALL BLOCKED] ${apiName} - Too many rapid calls detected`);
      return;
    }

    // Update tracker
    tracker.count++;
    tracker.lastCall = now;
    tracker.isActive = true;
    callCountRef.current++;
    lastCallTimeRef.current = now;

    // Log API call for debugging
    console.log(`📡 [API CALL] ${apiName} - Call #${tracker.count} at ${new Date(now).toLocaleTimeString()}`);

    // Warn if too many calls in short period
    if (tracker.count > 5) {
      console.warn(`⚠️ [API WARNING] ${apiName} has been called ${tracker.count} times. Check for infinite loops!`);
    }

    // Reset active flag after a delay
    const timeoutId = setTimeout(() => {
      tracker.isActive = false;
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [apiName, isEnabled]);

  return {
    callCount: callCountRef.current,
    lastCallTime: lastCallTimeRef.current,
    getGlobalStats: () => apiCallTracker
  };
};

// Utility to reset tracker for specific API
export const resetApiCallTracker = (apiName: string) => {
  if (apiCallTracker[apiName]) {
    apiCallTracker[apiName] = {
      count: 0,
      lastCall: 0,
      isActive: false
    };
  }
};

// Utility to get all API call stats
export const getAllApiCallStats = () => apiCallTracker;