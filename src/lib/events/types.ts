/**
 * Core Event Types for Event Sourcing
 * 
 * This is the single source of truth - all state changes happen through events
 */

import { z } from 'zod';

// Base event schema with all required fields for proper event sourcing
export const EventSchema = z.object({
  // Identity
  id: z.string().uuid(),
  type: z.string(),
  schemaVersion: z.number(),
  
  // Actor & Context
  actorId: z.string(),
  deviceId: z.string(),
  sessionId: z.string(),
  operationId: z.string().optional(),
  
  // Time & Order
  timestamp: z.number(), // Unix timestamp
  sequence: z.number().optional(), // For ordering within same timestamp
  
  // Payload
  payload: z.any(),
  
  // Traceability
  causationId: z.string().uuid().optional(), // What caused this event
  correlationId: z.string().uuid().optional(), // Group related events
  
  // Integrity
  hash: z.string().optional(), // SHA-256 of canonical event representation
  previousHash: z.string().optional(), // For hash chain
  
  // Sync metadata
  syncStatus: z.enum(['local', 'pending', 'synced', 'failed']).default('local'),
  syncAttempts: z.number().default(0),
  syncError: z.string().optional(),
  
  // Versioning & Migration
  migratedFrom: z.number().optional(), // Original schema version if migrated
});

export type Event = z.infer<typeof EventSchema>;

// Event type enum for type safety
export enum EventType {
  // Operation lifecycle
  OPERATION_CREATED = 'operation.created',
  OPERATION_UPDATED = 'operation.updated',
  OPERATION_CLOSED = 'operation.closed',
  OPERATION_ARCHIVED = 'operation.archived',
  
  // Geographic events
  REGION_SELECTED = 'geography.region_selected',
  COUNTY_ADDED = 'geography.county_added',
  COUNTY_REMOVED = 'geography.county_removed',
  CHAPTERS_CALCULATED = 'geography.chapters_calculated',
  
  // Roster events
  PERSON_ASSIGNED = 'roster.person_assigned',
  PERSON_UNASSIGNED = 'roster.person_unassigned',
  POSITION_CHANGED = 'roster.position_changed',
  PERSON_IMPORTED = 'roster.person_imported',
  
  // IAP events
  IAP_CREATED = 'iap.created',
  IAP_SECTION_UPDATED = 'iap.section_updated',
  IAP_PUBLISHED = 'iap.published',
  IAP_ARCHIVED = 'iap.archived',
  IAP_VERSION_CREATED = 'iap.version_created',
  IAP_SNAPSHOT_CREATED = 'iap.snapshot_created',
  IAP_OFFICIAL_SNAPSHOT = 'iap.official_snapshot',
  
  // Facility events
  FACILITY_CREATED = 'facility.created',
  FACILITY_UPDATED = 'facility.updated',
  FACILITY_STATUS_CHANGED = 'facility.status_changed',
  FACILITY_PERSONNEL_ASSIGNED = 'facility.personnel_assigned',
  FACILITY_PERSONNEL_REMOVED = 'facility.personnel_removed',
  FACILITY_RESOURCE_ADDED = 'facility.resource_added',
  FACILITY_RESOURCE_REMOVED = 'facility.resource_removed',
  
  // Work assignment events
  WORK_ASSIGNMENT_CREATED = 'work_assignment.created',
  WORK_ASSIGNMENT_UPDATED = 'work_assignment.updated',
  WORK_ASSIGNMENT_COMPLETED = 'work_assignment.completed',
  WORK_ASSIGNMENT_CANCELLED = 'work_assignment.cancelled',
  
  // IAP content events
  DIRECTORS_MESSAGE_UPDATED = 'iap.directors_message_updated',
  CONTACT_ROSTER_UPDATED = 'iap.contact_roster_updated',
  ORG_CHART_UPDATED = 'iap.org_chart_updated',
  DAILY_SCHEDULE_UPDATED = 'iap.daily_schedule_updated',
  PRIORITIES_UPDATED = 'iap.priorities_updated',
  PHOTO_ATTACHED = 'iap.photo_attached',
  ANCILLARY_CONTENT_UPDATED = 'iap.ancillary_content_updated',
  
  // Service metrics (CRDT-friendly)
  MEALS_SERVED_INCREMENT = 'metrics.meals_served.increment',
  SHELTERED_COUNT_SET = 'metrics.sheltered_count.set',
  SUPPLIES_DISTRIBUTED_ADD = 'metrics.supplies_distributed.add',
  
  // Collaboration
  USER_JOINED_OPERATION = 'collab.user_joined',
  USER_LEFT_OPERATION = 'collab.user_left',
  USER_STARTED_EDITING = 'collab.editing_started',
  USER_STOPPED_EDITING = 'collab.editing_stopped',
  
  // Sync & System
  SYNC_STARTED = 'system.sync_started',
  SYNC_COMPLETED = 'system.sync_completed',
  SYNC_FAILED = 'system.sync_failed',
  CONFLICT_DETECTED = 'system.conflict_detected',
  CONFLICT_RESOLVED = 'system.conflict_resolved',
  
  // Data management
  SNAPSHOT_CREATED = 'data.snapshot_created',
  MIGRATION_APPLIED = 'data.migration_applied',
  REDACTION_APPLIED = 'data.redaction_applied', // For PII removal
}

// Payload schemas for each event type
export const OperationCreatedPayload = z.object({
  operationNumber: z.string(),
  operationName: z.string(),
  disasterType: z.string(),
  activationLevel: z.string(),
  drNumber: z.string().optional(),
});

export const CountyAddedPayload = z.object({
  countyId: z.string(),
  countyName: z.string(),
  state: z.string(),
  fips: z.string(),
  region: z.string(),
});

export const PersonAssignedPayload = z.object({
  personId: z.string(),
  position: z.string(),
  section: z.string(),
  startDate: z.string(),
  reportingTo: z.string().optional(),
});

export const MealsServedIncrementPayload = z.object({
  location: z.string(),
  count: z.number().positive(),
  date: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

// IAP Event Payloads
export const IAPCreatedPayload = z.object({
  iapNumber: z.number(),
  operationalPeriodStart: z.string(),
  operationalPeriodEnd: z.string(),
  preparedBy: z.string(),
});

export const IAPSnapshotCreatedPayload = z.object({
  iapId: z.string(),
  versionId: z.string(),
  snapshotType: z.enum(['official_6pm', 'manual', 'scheduled']),
  isLocked: z.boolean().default(false),
  distributionList: z.array(z.string()).optional(),
});

export const FacilityCreatedPayload = z.object({
  facilityType: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  county: z.string(),
  primaryContact: z.string(),
  primaryPhone: z.string(),
  serviceLines: z.array(z.string()),
});

export const FacilityPersonnelAssignedPayload = z.object({
  facilityId: z.string(),
  personId: z.string(),
  position: z.string(),
  section: z.string(),
  startTime: z.string(),
  isLeader: z.boolean().default(false),
  reportingTo: z.string().optional(),
});

export const WorkAssignmentCreatedPayload = z.object({
  facilityId: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  assignedTo: z.array(z.string()),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
});

export const DirectorsMessageUpdatedPayload = z.object({
  iapId: z.string(),
  content: z.object({
    html: z.string(),
    plainText: z.string(),
  }),
  lastEditedBy: z.string(),
});

export const ContactRosterUpdatedPayload = z.object({
  iapId: z.string(),
  section: z.enum(['command', 'operations', 'planning', 'logistics', 'finance', 'external']),
  contacts: z.array(z.object({
    position: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    alternatePhone: z.string().optional(),
  })),
});

export const PhotoAttachedPayload = z.object({
  iapId: z.string(),
  filename: z.string(),
  caption: z.string(),
  location: z.string().optional(),
  photographer: z.string(),
  isCoverPhoto: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

// Event validation map
export const EventPayloadValidators: Record<string, z.ZodSchema> = {
  [EventType.OPERATION_CREATED]: OperationCreatedPayload,
  [EventType.COUNTY_ADDED]: CountyAddedPayload,
  [EventType.PERSON_ASSIGNED]: PersonAssignedPayload,
  [EventType.MEALS_SERVED_INCREMENT]: MealsServedIncrementPayload,
  // IAP validators
  [EventType.IAP_CREATED]: IAPCreatedPayload,
  [EventType.IAP_SNAPSHOT_CREATED]: IAPSnapshotCreatedPayload,
  [EventType.FACILITY_CREATED]: FacilityCreatedPayload,
  [EventType.FACILITY_PERSONNEL_ASSIGNED]: FacilityPersonnelAssignedPayload,
  [EventType.WORK_ASSIGNMENT_CREATED]: WorkAssignmentCreatedPayload,
  [EventType.DIRECTORS_MESSAGE_UPDATED]: DirectorsMessageUpdatedPayload,
  [EventType.CONTACT_ROSTER_UPDATED]: ContactRosterUpdatedPayload,
  [EventType.PHOTO_ATTACHED]: PhotoAttachedPayload,
};

// Conflict resolution policies
export enum ConflictResolution {
  LAST_WRITE_WINS = 'lww',
  FIRST_WRITE_WINS = 'fww',
  CRDT_MERGE = 'crdt',
  MANUAL = 'manual',
  DOMAIN_SPECIFIC = 'domain',
}

export interface ConflictPolicy {
  eventType: EventType;
  resolution: ConflictResolution;
  mergeFunction?: (local: Event, remote: Event) => Event;
}

// Default conflict policies
export const DefaultConflictPolicies: ConflictPolicy[] = [
  // Counts and metrics use CRDTs
  { eventType: EventType.MEALS_SERVED_INCREMENT, resolution: ConflictResolution.CRDT_MERGE },
  { eventType: EventType.SHELTERED_COUNT_SET, resolution: ConflictResolution.LAST_WRITE_WINS },
  
  // Roster changes need domain logic
  { eventType: EventType.PERSON_ASSIGNED, resolution: ConflictResolution.DOMAIN_SPECIFIC },
  
  // Geography is additive
  { eventType: EventType.COUNTY_ADDED, resolution: ConflictResolution.CRDT_MERGE },
  { eventType: EventType.COUNTY_REMOVED, resolution: ConflictResolution.CRDT_MERGE },
  
  // IAP updates are last-write-wins with versioning
  { eventType: EventType.IAP_SECTION_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
  { eventType: EventType.DIRECTORS_MESSAGE_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
  { eventType: EventType.CONTACT_ROSTER_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
  { eventType: EventType.ORG_CHART_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
  
  // Facility events - domain specific for business rules
  { eventType: EventType.FACILITY_CREATED, resolution: ConflictResolution.FIRST_WRITE_WINS },
  { eventType: EventType.FACILITY_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
  { eventType: EventType.FACILITY_PERSONNEL_ASSIGNED, resolution: ConflictResolution.DOMAIN_SPECIFIC },
  { eventType: EventType.FACILITY_RESOURCE_ADDED, resolution: ConflictResolution.CRDT_MERGE },
  
  // Work assignments - last write wins for status updates
  { eventType: EventType.WORK_ASSIGNMENT_CREATED, resolution: ConflictResolution.FIRST_WRITE_WINS },
  { eventType: EventType.WORK_ASSIGNMENT_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
  { eventType: EventType.WORK_ASSIGNMENT_COMPLETED, resolution: ConflictResolution.FIRST_WRITE_WINS },
  
  // Snapshots are immutable once created
  { eventType: EventType.IAP_SNAPSHOT_CREATED, resolution: ConflictResolution.FIRST_WRITE_WINS },
  { eventType: EventType.IAP_OFFICIAL_SNAPSHOT, resolution: ConflictResolution.FIRST_WRITE_WINS },
];

// Schema version for migration tracking
export const CURRENT_SCHEMA_VERSION = 1;

// UUID v4 generator for browser compatibility
function generateUUID() {
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

// Event creation helper
export function createEvent(
  type: EventType,
  payload: any,
  metadata: {
    actorId: string;
    operationId?: string;
    causationId?: string;
    correlationId?: string;
  }
): Event {
  const event: Event = {
    id: generateUUID(),
    type,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    actorId: metadata.actorId,
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    operationId: metadata.operationId,
    timestamp: Date.now(),
    payload,
    causationId: metadata.causationId,
    correlationId: metadata.correlationId || generateUUID(),
    syncStatus: 'local',
    syncAttempts: 0,
  };
  
  // Validate payload if validator exists
  const validator = EventPayloadValidators[type];
  if (validator) {
    validator.parse(payload);
  }
  
  // Generate hash
  event.hash = generateEventHash(event);
  
  return event;
}

// Helper to generate event hash for integrity
export function generateEventHash(event: Event): string {
  const canonical = JSON.stringify({
    id: event.id,
    type: event.type,
    actorId: event.actorId,
    timestamp: event.timestamp,
    payload: event.payload,
  });
  
  // In production, use Web Crypto API
  // return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  // For now, simple hash
  return btoa(canonical).substring(0, 32);
}

// Device and session helpers (move to utils later)
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let deviceId = localStorage.getItem('disaster_ops_device_id');
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem('disaster_ops_device_id', deviceId);
  }
  return deviceId;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sessionId = sessionStorage.getItem('disaster_ops_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('disaster_ops_session_id', sessionId);
  }
  return sessionId;
}