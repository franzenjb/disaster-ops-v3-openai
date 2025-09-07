/**
 * DIRECT DATA HOOK - Bypass IndexedDB complexity
 * 
 * Simple hook that provides immediate access to all permanent database content
 * No database connection issues, no version conflicts - just data
 */

import { useState, useEffect } from 'react';
import { initializeDirectData, dataStore } from '@/lib/services/DirectDataLoader';

interface DataCounts {
  personnel: number;
  assets: number;
  gaps: number;
  facilities: number;
}

export function useDirectData() {
  const [counts, setCounts] = useState<DataCounts>({
    personnel: 0,
    assets: 0,
    gaps: 0,
    facilities: 0
  });
  
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const stats = await initializeDirectData();
      setCounts(stats);
      setLoaded(true);
    };
    
    loadData();
  }, []);

  return {
    // Data access
    personnel: dataStore.getPersonnel(),
    assets: dataStore.getAssets(),
    gaps: dataStore.getGaps(),
    facilities: dataStore.getFacilities(),
    
    // Counts
    counts,
    loaded,
    
    // Add methods
    addFacility: (facility: any) => {
      const result = dataStore.addFacility(facility);
      setCounts(prev => ({ ...prev, facilities: prev.facilities + 1 }));
      return result;
    },
    
    addPersonnel: (person: any) => {
      const result = dataStore.addPersonnel(person);
      setCounts(prev => ({ ...prev, personnel: prev.personnel + 1 }));
      return result;
    },
    
    addGap: (gap: any) => {
      const result = dataStore.addGap(gap);
      setCounts(prev => ({ ...prev, gaps: prev.gaps + 1 }));
      return result;
    }
  };
}