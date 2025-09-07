'use client';

import React, { useRef, useEffect, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  className?: string;
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Enter address...",
  className = ""
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        initializeAutocomplete();
      } else {
        // Load Google Maps script if not already loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            setIsLoaded(true);
            initializeAutocomplete();
          };
          document.head.appendChild(script);
        } else {
          // Script exists, wait for it to load
          const checkLoaded = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              clearInterval(checkLoaded);
              setIsLoaded(true);
              initializeAutocomplete();
            }
          }, 100);
        }
      }
    };

    const initializeAutocomplete = () => {
      if (inputRef.current && window.google && window.google.maps && window.google.maps.places) {
        // Destroy existing autocomplete if it exists
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        // Create new autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id']
          }
        );

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
        });
      }
    };

    loadGooglePlaces();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 ${className}`}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="text-xs text-gray-400">Loading places...</div>
        </div>
      )}
    </div>
  );
}