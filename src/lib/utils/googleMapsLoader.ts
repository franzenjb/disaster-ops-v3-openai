'use client';

/**
 * Centralized Google Maps API loader to prevent multiple API loads
 * Fixes the "included Google Maps JavaScript API multiple times" error
 * Now uses async loading for better performance
 */

declare global {
  interface Window {
    google: any;
    __googleMapsLoading?: Promise<void>;
    __googleMapsCallback?: () => void;
  }
}

let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsAPI = (): Promise<void> => {
  // If already loaded, return immediately
  if (isLoaded && window.google?.maps) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Check if script already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript && window.google?.maps) {
    isLoaded = true;
    return Promise.resolve();
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    // Create unique callback name to avoid conflicts
    const callbackName = `__googleMapsCallback_${Date.now()}`;
    
    // Set up the callback
    window[callbackName as any] = () => {
      // Wait for Google Maps to be fully initialized
      const checkGoogleMaps = () => {
        if (window.google?.maps?.Map && window.google?.maps?.places) {
          isLoaded = true;
          isLoading = false;
          // Clean up callback
          delete window[callbackName as any];
          resolve();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    };

    // Use proper async loading with callback - include marker library for AdvancedMarkerElement
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      isLoading = false;
      loadPromise = null;
      // Clean up callback
      delete window[callbackName as any];
      reject(new Error('Failed to load Google Maps API'));
    };

    // Only add if not already present
    if (!existingScript) {
      document.head.appendChild(script);
    } else {
      // Script exists but Google isn't loaded yet, wait for it
      const checkExisting = () => {
        if (window.google?.maps?.Map && window.google?.maps?.places) {
          isLoaded = true;
          isLoading = false;
          delete window[callbackName as any];
          resolve();
        } else {
          setTimeout(checkExisting, 100);
        }
      };
      checkExisting();
    }
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && !!window.google?.maps;
};

export const waitForGoogleMaps = (): Promise<void> => {
  if (isGoogleMapsLoaded()) {
    return Promise.resolve();
  }
  return loadGoogleMapsAPI();
};