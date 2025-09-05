/**
 * Simple Store - No event sourcing, no complexity, just works
 * Uses localStorage for persistence, upgradeable to any database later
 */

export interface SimpleFacility {
  id: string;
  name: string;
  type: string;
  address: string;
  county: string;
  operationalPeriod: {
    start: string;
    end: string;
  };
  shifts: string[];
  personnel: {
    positions: Array<{
      code: string;
      title: string;
      required: number;
      have: number;
      gap: number;
    }>;
  };
  resources: {
    assets: Array<{
      type: string;
      unit: string;
      required: number;
      have: number;
      gap: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

class SimpleStore {
  private storageKey = 'disaster_ops_data';
  
  private getData(): any {
    if (typeof window === 'undefined') return { facilities: [], assignments: [] };
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : { facilities: [], assignments: [] };
  }
  
  private saveData(data: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  // Create a facility
  createFacility(facility: Omit<SimpleFacility, 'id' | 'createdAt' | 'updatedAt'>): SimpleFacility {
    const newFacility: SimpleFacility = {
      ...facility,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const data = this.getData();
    data.facilities.push(newFacility);
    this.saveData(data);
    
    return newFacility;
  }
  
  // Get all facilities
  getFacilities(): SimpleFacility[] {
    const data = this.getData();
    return data.facilities || [];
  }
  
  // Update a facility
  updateFacility(id: string, updates: Partial<SimpleFacility>): SimpleFacility | null {
    const data = this.getData();
    const index = data.facilities.findIndex((f: SimpleFacility) => f.id === id);
    
    if (index === -1) return null;
    
    data.facilities[index] = {
      ...data.facilities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveData(data);
    return data.facilities[index];
  }
  
  // Delete a facility
  deleteFacility(id: string): boolean {
    const data = this.getData();
    const initialLength = data.facilities.length;
    data.facilities = data.facilities.filter((f: SimpleFacility) => f.id !== id);
    
    if (data.facilities.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }
  
  // Create work assignment (simplified)
  createWorkAssignment(assignmentData: any): string {
    const data = this.getData();
    const assignment = {
      ...assignmentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    if (!data.assignments) data.assignments = [];
    data.assignments.push(assignment);
    this.saveData(data);
    
    return assignment.id;
  }
  
  // Get all work assignments
  getWorkAssignments(): any[] {
    const data = this.getData();
    return data.assignments || [];
  }
  
  // Get work assignment by facility ID
  getWorkAssignment(facilityId: string): any | null {
    const data = this.getData();
    const assignments = data.assignments || [];
    return assignments.find((a: any) => a.facilityId === facilityId) || null;
  }
  
  // Clear all data (for testing)
  clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
  
  // Export data
  exportData(): any {
    return this.getData();
  }
  
  // Import data
  importData(importedData: any): void {
    this.saveData(importedData);
  }
  
  // Contact roster methods
  saveContactRoster(roster: any[]): void {
    const data = this.getData();
    data.contactRoster = roster;
    this.saveData(data);
  }
  
  getContactRoster(): any[] {
    const data = this.getData();
    return data.contactRoster || [];
  }
}

// Export singleton instance
export const simpleStore = new SimpleStore();

// Helper to generate IAP from current data
export function generateSimpleIAP(facilities: SimpleFacility[]) {
  const totalPersonnelRequired = facilities.reduce((sum, f) => 
    sum + f.personnel.positions.reduce((s, p) => s + p.required, 0), 0
  );
  
  const totalPersonnelHave = facilities.reduce((sum, f) => 
    sum + f.personnel.positions.reduce((s, p) => s + p.have, 0), 0
  );
  
  const totalResourcesRequired = facilities.reduce((sum, f) => 
    sum + f.resources.assets.reduce((s, a) => s + a.required, 0), 0
  );
  
  const totalResourcesHave = facilities.reduce((sum, f) => 
    sum + f.resources.assets.reduce((s, a) => s + a.have, 0), 0
  );
  
  return {
    generatedAt: new Date().toISOString(),
    facilitiesCount: facilities.length,
    personnel: {
      required: totalPersonnelRequired,
      have: totalPersonnelHave,
      gap: totalPersonnelRequired - totalPersonnelHave
    },
    resources: {
      required: totalResourcesRequired,
      have: totalResourcesHave,
      gap: totalResourcesRequired - totalResourcesHave
    },
    facilities: facilities.map(f => ({
      name: f.name,
      type: f.type,
      county: f.county,
      personnelGap: f.personnel.positions.reduce((sum, p) => sum + p.gap, 0),
      resourceGap: f.resources.assets.reduce((sum, a) => sum + a.gap, 0)
    }))
  };
}