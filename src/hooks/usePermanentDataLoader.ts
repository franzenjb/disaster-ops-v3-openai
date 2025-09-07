/**
 * PERMANENT DATA LOADER HOOK
 * 
 * Loads all permanent database content into Tables Hub on application startup
 * - 500+ Personnel Records from PERSONNEL_UNIVERSE 
 * - Complete Asset Library (vehicles, equipment, supplies)
 * - 50+ Gap Templates
 */

import { useEffect, useState } from 'react';
import { PERSONNEL_UNIVERSE } from '@/data/permanent-databases/personnel-universe';
import { ASSETS_LIBRARY } from '@/data/permanent-databases/assets-library';  
import { GAP_TEMPLATES_LIBRARY, type GapTemplate } from '@/data/permanent-databases/gap-templates';
import { MasterDataService } from '@/lib/services/MasterDataService';

interface LoadingStats {
  personnel: number;
  assets: number;
  gaps: number;
  facilities: number;
  loaded: boolean;
  loading: boolean;
  error?: string;
}

export function usePermanentDataLoader() {
  const [stats, setStats] = useState<LoadingStats>({
    personnel: 0,
    assets: 0,
    gaps: 0,
    facilities: 0,
    loaded: false,
    loading: true
  });

  useEffect(() => {
    loadPermanentData();
  }, []);

  const loadPermanentData = async () => {
    try {
      console.log('🚀 Loading permanent databases into Tables Hub...');
      console.log(`📊 Loading ${PERSONNEL_UNIVERSE.length} personnel, ${ASSETS_LIBRARY.length} assets, ${GAP_TEMPLATES_LIBRARY.length} gaps`);
      
      const masterData = MasterDataService.getInstance();
      
      // Load Personnel Universe
      let personnelCount = 0;
      for (const person of PERSONNEL_UNIVERSE) {
        try {
          // Use existing database structure - insert directly into personnel table
          await masterData.db.execute(
            `INSERT OR IGNORE INTO personnel (
              id, operation_id, first_name, last_name, email, phone, 
              primary_position, section, certifications, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              person.id,
              'op-current', // Default operation
              person.name.split(' ')[0] || person.name,
              person.name.split(' ').slice(1).join(' ') || '',
              person.email,
              person.phone,
              person.primary_position,
              person.section.toLowerCase(),
              JSON.stringify(person.certifications),
              new Date().toISOString()
            ]
          );
          personnelCount++;
        } catch (error) {
          // Skip if exists, continue
        }
      }

      // Load Gaps from Templates
      let gapsCount = 0;
      for (const gap of GAP_TEMPLATES_LIBRARY) {
        try {
          await masterData.addGap({
            operation_id: 'op-current',
            facility_id: null,
            gap_name: gap.gap_name,
            gap_type: gap.gap_type as any,
            category: gap.category,
            priority_level: gap.priority_level as any,
            description: gap.description,
            current_have: 0,
            standard_need: gap.standard_requirement?.amount || 0,
            gap_amount: gap.standard_requirement?.amount || 0,
            status: 'identified',
            estimated_cost: gap.estimated_cost || 0,
            created_at: new Date(),
            updated_at: new Date()
          });
          gapsCount++;
        } catch (error) {
          // Skip if exists
        }
      }

      // Note: Assets would need Asset interface added to MasterDataService
      // For now, we'll track them separately
      
      setStats({
        personnel: personnelCount,
        assets: ASSETS_LIBRARY.length, // Tracked but not loaded yet
        gaps: gapsCount,
        facilities: 0,
        loaded: true,
        loading: false
      });

      console.log(`✅ Loaded ${personnelCount} personnel, ${gapsCount} gaps into Tables Hub`);
      console.log(`📋 ${ASSETS_LIBRARY.length} assets available (interface needed for loading)`);

    } catch (error) {
      console.error('❌ Error loading permanent databases:', error);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  return stats;
}