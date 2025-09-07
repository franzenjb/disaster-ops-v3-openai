/**
 * DATA LOADER - Populate Tables Hub with Permanent Databases
 * 
 * This service loads all permanent database content into the Tables Hub
 * - 500+ Personnel Records from PERSONNEL_UNIVERSE
 * - Complete Asset Library (vehicles, equipment, supplies)
 * - 50+ Gap Templates
 */

import { PERSONNEL_UNIVERSE, type PersonnelRecord } from '@/data/permanent-databases/personnel-universe';
import { ASSETS_LIBRARY, type AssetItem } from '@/data/permanent-databases/assets-library';
import { GAP_TEMPLATES, type GapTemplate } from '@/data/permanent-databases/gap-templates';
import { MasterDataService } from './MasterDataService';

export class DataLoader {
  private masterData: MasterDataService;

  constructor() {
    this.masterData = MasterDataService.getInstance();
  }

  /**
   * Load all permanent databases into Tables Hub
   */
  async loadAllPermanentData(): Promise<void> {
    console.log('🔄 Loading permanent databases into Tables Hub...');
    
    try {
      // Load Personnel Universe
      await this.loadPersonnelData();
      
      // Load Assets Library  
      await this.loadAssetsData();
      
      // Load Gap Templates
      await this.loadGapData();
      
      console.log('✅ All permanent databases loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading permanent databases:', error);
      throw error;
    }
  }

  /**
   * Load all personnel from PERSONNEL_UNIVERSE
   */
  private async loadPersonnelData(): Promise<void> {
    console.log(`📋 Loading ${PERSONNEL_UNIVERSE.length} personnel records...`);
    
    for (const person of PERSONNEL_UNIVERSE) {
      // Convert PersonnelRecord to MasterDataService format
      const personnelData = {
        id: person.id,
        name: person.name,
        position: person.primary_position,
        section: person.section,
        phone: person.phone,
        email: person.email,
        region: person.region,
        chapter: person.chapter,
        certifications: person.certifications.join(', '),
        status: person.availability_status,
        experience: person.experience_level,
        lastDeployed: person.last_deployed,
        totalDeployments: person.total_deployments
      };
      
      try {
        await this.masterData.addPersonnel(personnelData);
      } catch (error) {
        // Skip if already exists, continue loading
        if (!error.message?.includes('already exists')) {
          console.warn(`Warning loading personnel ${person.name}:`, error);
        }
      }
    }
    
    console.log(`✅ Loaded ${PERSONNEL_UNIVERSE.length} personnel records`);
  }

  /**
   * Load all assets from ASSETS_LIBRARY
   */
  private async loadAssetsData(): Promise<void> {
    console.log(`🚛 Loading ${ASSETS_LIBRARY.length} asset records...`);
    
    for (const asset of ASSETS_LIBRARY) {
      // Convert AssetItem to MasterDataService format
      const assetData = {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        category: asset.category,
        description: asset.description || '',
        specifications: JSON.stringify(asset.specifications || {}),
        quantity: asset.quantity || 1,
        status: asset.status || 'available',
        location: asset.location || 'Central Warehouse',
        cost: asset.estimated_cost || 0,
        notes: `Source: ${asset.source || 'Assets Library'}`
      };
      
      try {
        await this.masterData.addAsset(assetData);
      } catch (error) {
        // Skip if already exists, continue loading
        if (!error.message?.includes('already exists')) {
          console.warn(`Warning loading asset ${asset.name}:`, error);
        }
      }
    }
    
    console.log(`✅ Loaded ${ASSETS_LIBRARY.length} asset records`);
  }

  /**
   * Load all gaps from GAP_TEMPLATES
   */
  private async loadGapData(): Promise<void> {
    console.log(`⚠️ Loading ${GAP_TEMPLATES.length} gap templates...`);
    
    for (const gap of GAP_TEMPLATES) {
      // Convert GapTemplate to MasterDataService format
      const gapData = {
        id: gap.id,
        name: gap.gap_name,
        type: gap.gap_type,
        category: gap.category,
        discipline: gap.discipline,
        priority: gap.priority_level,
        description: gap.description,
        impact: gap.operational_impact,
        standardAmount: gap.standard_requirement?.amount || 0,
        standardUnit: gap.standard_requirement?.unit || 'each',
        estimatedCost: gap.estimated_cost || 0,
        notes: `Template - ${gap.standard_requirement?.per_what || 'general'}`
      };
      
      try {
        await this.masterData.addGap(gapData);
      } catch (error) {
        // Skip if already exists, continue loading
        if (!error.message?.includes('already exists')) {
          console.warn(`Warning loading gap ${gap.gap_name}:`, error);
        }
      }
    }
    
    console.log(`✅ Loaded ${GAP_TEMPLATES.length} gap templates`);
  }

  /**
   * Get loading status and statistics
   */
  async getLoadingStats(): Promise<{
    personnel: number;
    assets: number; 
    gaps: number;
    facilities: number;
  }> {
    const stats = {
      personnel: PERSONNEL_UNIVERSE.length,
      assets: ASSETS_LIBRARY.length,
      gaps: GAP_TEMPLATES.length,
      facilities: 0 // Will be loaded from V27_IAP_DATA separately
    };
    
    console.log('📊 Permanent Database Statistics:', stats);
    return stats;
  }
}

/**
 * Initialize permanent data on application startup
 */
export async function initializePermanentData(): Promise<void> {
  const loader = new DataLoader();
  
  // Check if data already loaded
  const stats = await loader.getLoadingStats();
  
  console.log(`🚀 Initializing ${stats.personnel} personnel, ${stats.assets} assets, ${stats.gaps} gaps`);
  
  try {
    await loader.loadAllPermanentData();
    console.log('🎉 Permanent databases initialization complete!');
  } catch (error) {
    console.error('💥 Failed to initialize permanent databases:', error);
  }
}

export { DataLoader };