/**
 * Work Assignment Event Handlers
 * Implements event sourcing for work assignment creation and updates
 */

import { EventType, createEvent } from './types';
import { DatabaseManager } from '../database/DatabaseManager';

// Simple UUID v4 generator for browser compatibility
function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize database
let db: DatabaseManager | null = null;

async function getDb(): Promise<DatabaseManager> {
  if (!db) {
    db = DatabaseManager.getInstance();
  }
  return db;
}

export interface WorkAssignmentData {
  facility: {
    name: string;
    address: string;
    county: string;
    operationalPeriod: {
      start: string;
      end: string;
    };
    shifts: string[];
  };
  facilityType: string;
  positions: Array<{
    code: string;
    title: string;
    required: number;
    have: number;
    gap: number;
  }>;
  assets: Array<{
    type: string;
    unit: string;
    required: number;
    have: number;
    gap: number;
  }>;
  createdAt: string;
}

/**
 * Create a new work assignment
 */
export async function createWorkAssignment(data: WorkAssignmentData): Promise<string> {
  const database = await getDb();
  const assignmentId = uuidv4();
  
  // Create the event
  const event = createEvent(
    EventType.WORK_ASSIGNMENT_CREATED,
    {
      assignmentId,
      ...data
    },
    {
      actorId: 'current-user' // In real app, get from auth context
    }
  );
  
  // Store the event
  await database.appendEvent(event);
  
  // Also create a facility if this is a new one
  const facilityId = uuidv4();
  const facilityEvent = createEvent(
    EventType.FACILITY_CREATED,
    {
      facilityId,
      assignmentId,
      name: data.facility.name,
      type: data.facilityType,
      address: data.facility.address,
      county: data.facility.county,
      status: 'active',
      personnel: {
        required: data.positions.reduce((sum, p) => sum + p.required, 0),
        have: data.positions.reduce((sum, p) => sum + p.have, 0),
        gap: data.positions.reduce((sum, p) => sum + p.gap, 0)
      },
      positions: data.positions,
      assets: data.assets
    },
    {
      actorId: 'current-user'
    }
  );
  
  await database.appendEvent(facilityEvent);
  
  return assignmentId;
}

/**
 * Update personnel for a facility
 */
export async function updateFacilityPersonnel(
  facilityId: string,
  positionCode: string,
  required: number,
  have: number
): Promise<void> {
  const database = await getDb();
  
  const event = createEvent(
    EventType.FACILITY_PERSONNEL_ASSIGNED,
    {
      facilityId,
      positionCode,
      required,
      have,
      gap: Math.max(0, required - have)
    },
    {
      actorId: 'current-user'
    }
  );
  
  await database.appendEvent(event);
}

/**
 * Update assets for a facility
 */
export async function updateFacilityAssets(
  facilityId: string,
  assetType: string,
  required: number,
  have: number
): Promise<void> {
  const database = await getDb();
  
  const event = createEvent(
    EventType.FACILITY_RESOURCE_ADDED,
    {
      facilityId,
      assetType,
      required,
      have,
      gap: Math.max(0, required - have)
    },
    {
      actorId: 'current-user'
    }
  );
  
  await database.appendEvent(event);
}

/**
 * Get all facilities from events
 */
export async function getAllFacilities(): Promise<any[]> {
  const database = await getDb();
  const events = await database.getEventsByType(EventType.FACILITY_CREATED);
  
  // Build current state from events
  const facilities = events.map(event => ({
    id: event.payload.facilityId,
    ...event.payload
  }));
  
  // Apply updates from other events
  const updateEvents = await database.getEventsByType(EventType.FACILITY_UPDATED);
  const personnelEvents = await database.getEventsByType(EventType.FACILITY_PERSONNEL_ASSIGNED);
  const resourceEvents = await database.getEventsByType(EventType.FACILITY_RESOURCE_ADDED);
  
  // Apply updates to facilities (event sourcing pattern)
  // In a real system, you'd have a proper projection
  facilities.forEach(facility => {
    // Apply personnel updates
    personnelEvents
      .filter(e => e.payload.facilityId === facility.id)
      .forEach(e => {
        const position = facility.positions?.find((p: any) => p.code === e.payload.positionCode);
        if (position) {
          position.required = e.payload.required;
          position.have = e.payload.have;
          position.gap = e.payload.gap;
        }
      });
    
    // Apply resource updates  
    resourceEvents
      .filter(e => e.payload.facilityId === facility.id)
      .forEach(e => {
        const asset = facility.assets?.find((a: any) => a.type === e.payload.assetType);
        if (asset) {
          asset.required = e.payload.required;
          asset.have = e.payload.have;
          asset.gap = e.payload.gap;
        }
      });
  });
  
  return facilities;
}