/**
 * Google Places Address Autocomplete Component
 * 
 * This component provides address autocomplete functionality using the Google Places API,
 * addressing one of the key missing features identified in the salvage operation.
 * 
 * PHASE 2 - WEEK 2 IMPLEMENTATION
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, placeDetails?: google.maps.places.PlaceResult) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  // Restrict search to specific types
  types?: string[];
  // Restrict search to specific countries (ISO 3166-1 Alpha-2 codes)
  countries?: string[];
  // Bounds for biasing results
  bounds?: google.maps.LatLngBounds;
}

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces: () => void;
  }
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Enter facility address...",
  className = "",
  disabled = false,
  required = false,
  types = ['establishment', 'geocode'], // Include businesses and addresses
  countries = ['us'], // Restrict to US for Red Cross operations
  bounds
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Google Places API
  useEffect(() => {
    const initializePlaces = async () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return;
      }

      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not found. Address autocomplete disabled.');
        return;
      }

      setIsLoading(true);

      // Load Google Maps Places API (prevent duplicates)
      if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-script'; // Add ID to prevent duplicates

        window.initGooglePlaces = () => {
          setIsLoaded(true);
          setIsLoading(false);
        };

        document.head.appendChild(script);
      }
    };

    initializePlaces();
  }, []);

  // Initialize autocomplete when Google Places API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      // Create autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: types,
        componentRestrictions: { country: countries },
        bounds: bounds,
        strictBounds: false,
        fields: [
          'address_components',
          'formatted_address',
          'geometry',
          'name',
          'place_id',
          'types',
          'url',
          'vicinity'
        ]
      });

      autocompleteRef.current = autocomplete;

      // Add place selection listener
      const placeChangedListener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          console.warn('Place has no geometry');
          return;
        }

        // Extract address components for better data structure
        const addressComponents = extractAddressComponents(place.address_components || []);
        
        // Update the input value with formatted address
        const formattedAddress = place.formatted_address || '';
        onChange(formattedAddress, place);
        
        // Call place selected callback with enhanced data
        if (onPlaceSelected) {
          onPlaceSelected({
            ...place,
            // Add extracted components for easier access
            extracted_components: addressComponents
          });
        }

        console.log('✅ Place selected:', {
          name: place.name,
          address: formattedAddress,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          components: addressComponents
        });
      });

      // Cleanup listener on unmount
      return () => {
        if (placeChangedListener) {
          window.google.maps.event.removeListener(placeChangedListener);
        }
      };

    } catch (error) {
      console.error('Failed to initialize Google Places Autocomplete:', error);
    }
  }, [isLoaded, onChange, onPlaceSelected, types, countries, bounds]);

  // Extract and structure address components
  const extractAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
    const extracted = {
      street_number: '',
      route: '',
      locality: '', // City
      administrative_area_level_2: '', // County
      administrative_area_level_1: '', // State
      postal_code: '',
      country: ''
    };

    for (const component of components) {
      const type = component.types[0];
      
      switch (type) {
        case 'street_number':
          extracted.street_number = component.long_name;
          break;
        case 'route':
          extracted.route = component.long_name;
          break;
        case 'locality':
        case 'political':
          if (!extracted.locality) {
            extracted.locality = component.long_name;
          }
          break;
        case 'administrative_area_level_2':
          extracted.administrative_area_level_2 = component.long_name;
          break;
        case 'administrative_area_level_1':
          extracted.administrative_area_level_1 = component.short_name;
          break;
        case 'postal_code':
          extracted.postal_code = component.long_name;
          break;
        case 'country':
          extracted.country = component.long_name;
          break;
      }
    }

    return extracted;
  };

  // Handle manual input changes (typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Render different states
  if (isLoading) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="Loading Google Places..."
          className={`${className} bg-gray-100`}
          disabled={true}
          required={required}
        />
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isLoaded || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder + " (Manual entry - Google Places unavailable)"}
          className={className}
          disabled={disabled}
          required={required}
        />
        <div className="absolute right-3 top-3 text-yellow-600" title="Google Places API not available">
          ⚠️
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
      <div className="absolute right-3 top-3 text-green-600" title="Google Places autocomplete enabled">
        📍
      </div>
    </div>
  );
}

/**
 * Hook for easy integration with forms
 */
export function useGooglePlaces() {
  const [address, setAddress] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleAddressChange = (newAddress: string, placeDetails?: google.maps.places.PlaceResult) => {
    setAddress(newAddress);
    
    if (placeDetails) {
      setSelectedPlace(placeDetails);
      
      // Extract coordinates
      if (placeDetails.geometry?.location) {
        setCoordinates({
          lat: placeDetails.geometry.location.lat(),
          lng: placeDetails.geometry.location.lng()
        });
      }
    }
  };

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    
    // Auto-extract county information for Red Cross operations
    if (place.extracted_components) {
      const county = place.extracted_components.administrative_area_level_2;
      console.log('County extracted:', county);
    }
  };

  const reset = () => {
    setAddress('');
    setSelectedPlace(null);
    setCoordinates(null);
  };

  return {
    address,
    selectedPlace,
    coordinates,
    handleAddressChange,
    handlePlaceSelected,
    reset,
    // Helper functions
    getCounty: () => selectedPlace?.extracted_components?.administrative_area_level_2 || '',
    getCity: () => selectedPlace?.extracted_components?.locality || '',
    getState: () => selectedPlace?.extracted_components?.administrative_area_level_1 || '',
    getZip: () => selectedPlace?.extracted_components?.postal_code || ''
  };
}

/**
 * Utility function to format phone numbers for clicking
 */
export function formatPhoneForClick(phone: string): string {
  // Remove all non-numeric characters
  const numbersOnly = phone.replace(/\D/g, '');
  
  // Add +1 for US numbers if not present
  if (numbersOnly.length === 10) {
    return `+1${numbersOnly}`;
  } else if (numbersOnly.length === 11 && numbersOnly.startsWith('1')) {
    return `+${numbersOnly}`;
  }
  
  return numbersOnly;
}

/**
 * Clickable phone number component
 */
interface ClickablePhoneProps {
  phone: string;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function ClickablePhone({ 
  phone, 
  className = "text-blue-600 hover:underline",
  showIcon = true,
  children 
}: ClickablePhoneProps) {
  const formattedPhone = formatPhoneForClick(phone);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent element clicks
    
    // Track usage for analytics
    console.log('📞 Phone number clicked:', phone);
  };
  
  return (
    <a 
      href={`tel:${formattedPhone}`}
      className={className}
      onClick={handleClick}
      title={`Call ${phone}`}
    >
      {showIcon && '📞 '}
      {children || phone}
    </a>
  );
}

export default GooglePlacesAutocomplete;