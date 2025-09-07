/**
 * DIRECT DATA LOADER - Bypass all complexity
 * 
 * Simple, direct approach to populate Tables Hub
 * No complex database versioning - just load the data
 */

import { PERSONNEL_UNIVERSE } from '@/data/permanent-databases/personnel-universe';
import { ASSETS_LIBRARY } from '@/data/permanent-databases/assets-library';
import { GAP_TEMPLATES_LIBRARY } from '@/data/permanent-databases/gap-templates';

// Simple in-memory storage that mimics database
class SimpleDataStore {
  private personnel: any[] = [];
  private assets: any[] = [];
  private gaps: any[] = [];
  private facilities: any[] = [];

  // Load all permanent data immediately
  async loadAllData() {
    console.log('🚀 Direct loading permanent databases...');
    
    // Load Personnel
    this.personnel = PERSONNEL_UNIVERSE.map(person => ({
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
      created_at: new Date().toISOString()
    }));

    // Load Assets  
    this.assets = ASSETS_LIBRARY.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      category: asset.category,
      description: asset.description || '',
      quantity: asset.quantity || 1,
      status: asset.status || 'available',
      location: asset.location || 'Central Warehouse',
      cost: asset.estimated_cost || 0
    }));

    // Load Gaps
    this.gaps = GAP_TEMPLATES_LIBRARY.map(gap => ({
      id: gap.id,
      name: gap.gap_name,
      type: gap.gap_type,
      category: gap.category,
      priority: gap.priority_level,
      description: gap.description,
      impact: gap.operational_impact,
      standard: gap.standard_requirement?.amount || 0,
      cost: gap.estimated_cost || 0
    }));

    console.log(`✅ Loaded ${this.personnel.length} personnel`);
    console.log(`✅ Loaded ${this.assets.length} assets`);
    console.log(`✅ Loaded ${this.gaps.length} gaps`);
    
    return {
      personnel: this.personnel.length,
      assets: this.assets.length,
      gaps: this.gaps.length,
      facilities: this.facilities.length
    };
  }

  // Getters for data
  getPersonnel() { return this.personnel; }
  getAssets() { return this.assets; }
  getGaps() { return this.gaps; }
  getFacilities() { return this.facilities; }

  // Add methods
  addFacility(facility: any) {
    const newFacility = { ...facility, id: `fac-${Date.now()}` };
    this.facilities.push(newFacility);
    console.log('✅ Added facility:', newFacility.name);
    return newFacility;
  }

  addPersonnel(person: any) {
    const newPerson = { ...person, id: `per-${Date.now()}` };
    this.personnel.push(newPerson);
    return newPerson;
  }

  addGap(gap: any) {
    const newGap = { ...gap, id: `gap-${Date.now()}` };
    this.gaps.push(newGap);
    return newGap;
  }
}

// Global instance
const dataStore = new SimpleDataStore();

// Initialize immediately
let isLoaded = false;
export async function initializeDirectData() {
  if (!isLoaded) {
    const stats = await dataStore.loadAllData();
    isLoaded = true;
    return stats;
  }
  return {
    personnel: dataStore.getPersonnel().length,
    assets: dataStore.getAssets().length,
    gaps: dataStore.getGaps().length,
    facilities: dataStore.getFacilities().length
  };
}

// Export the store
export { dataStore };

export default dataStore;