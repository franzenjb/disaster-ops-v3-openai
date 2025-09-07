/**
 * CRITICAL: Master Data Service - Single Source of Truth
 * 
 * This service is the ONLY way to interact with the master database.
 * ALL components (Tables Hub, IAP Editor, Facility Manager, etc.) 
 * MUST use this service for data access.
 * 
 * BIDIRECTIONAL SYNC: Changes made anywhere instantly propagate everywhere.
 */

import { eventBus } from '../sync/EventBus';
import { EventType } from '../events/types';
import { DatabaseManager } from '../database/DatabaseManager';

// Master data types matching the schema
export interface Operation {
  id: string;
  name: string;
  type: 'emergency' | 'training' | 'drill';
  status: 'planning' | 'active' | 'demobilizing' | 'closed';
  start_date: Date;
  end_date?: Date;
  incident_commander?: string;
  dro_director?: string;
  geographic_scope?: {
    counties?: string[];
    states?: string[];
    coordinates?: any;
  };
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  metadata?: any;
}

export interface DailyScheduleEntry {
  id: string;
  operation_id: string;
  time: string;
  event_name: string;
  location?: string;
  responsible_party?: string;
  notes?: string;
  event_type?: 'briefing' | 'operation' | 'meeting' | 'deadline';
  priority?: number;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export interface Facility {
  id: string;
  operation_id: string;
  facility_type: 'shelter' | 'feeding' | 'government' | 'distribution' | 'care' | 'assessment';
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  county?: string;
  coordinates?: { lat: number; lng: number };
  status: 'planned' | 'open' | 'closed' | 'standby';
  capacity?: {
    maximum?: number;
    current?: number;
    available?: number;
  };
  contact_info?: {
    manager?: string;
    phone?: string;
    email?: string;
  };
  hours_operation?: {
    open?: string;
    close?: string;
    is_24hr?: boolean;
  };
  special_notes?: string;
  amenities?: string[];
  accessibility_features?: string[];
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export interface Personnel {
  id: string;
  operation_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  radio_call_sign?: string;
  primary_position?: string;
  section?: 'command' | 'operations' | 'planning' | 'logistics' | 'finance';
  certifications?: string[];
  availability?: any;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  dietary_restrictions?: string;
  medical_notes?: string;
  background_check_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export interface PersonnelAssignment {
  id: string;
  operation_id: string;
  person_id: string;
  facility_id?: string;
  position: string;
  shift_start?: string;
  shift_end?: string;
  shift_type?: 'day' | 'night' | 'swing' | 'on-call';
  start_date: Date;
  end_date?: Date;
  status?: 'assigned' | 'active' | 'completed' | 'cancelled';
  supervisor_id?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export interface WorkAssignment {
  id: string;
  operation_id: string;
  facility_id?: string;
  assignment_type: 'shelter' | 'feeding' | 'government' | 'assessment' | 'distribution';
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  skills_required?: string[];
  equipment_needed?: string[];
  safety_requirements?: string[];
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  completed_at?: Date;
  completed_by?: string;
}

export interface Gap {
  id: string;
  operation_id: string;
  facility_id?: string;
  gap_type: 'personnel' | 'equipment' | 'supplies' | 'vehicles' | 'space';
  gap_category?: string;
  quantity_needed: number;
  quantity_available?: number;
  quantity_requested?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'requested' | 'filled' | 'cancelled';
  description?: string;
  requirements?: any;
  requested_date?: Date;
  needed_date?: Date;
  filled_date?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

// Change event types for real-time sync
export interface DataChangeEvent {
  type: 'insert' | 'update' | 'delete';
  table: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  changed_fields?: string[];
  user_id?: string;
  timestamp: Date;
  correlation_id: string;
}

/**
 * Master Data Service - THE single source of truth for all data operations
 */
export class MasterDataService {
  private static instance: MasterDataService;
  private db: DatabaseManager;
  private currentOperationId: string | null = null;
  private changeListeners: Map<string, Set<(data: any[]) => void>> = new Map();
  private recordListeners: Map<string, Set<(record: any) => void>> = new Map();

  private constructor() {
    // Only initialize database on client side
    if (typeof window !== 'undefined') {
      try {
        this.db = DatabaseManager.getInstance();
      } catch (error) {
        // Initialize with default config
        this.db = DatabaseManager.getInstance({
          permanent: {
            enabled: false // Will be enabled when Supabase is configured
          },
          temporary: {
            dbName: 'disaster_ops_v3',
            version: 1
          }
        });
      }
      this.setupEventListeners();
    } else {
      // Server-side: defer initialization
      this.db = null as any;
    }
  }

  static getInstance(): MasterDataService {
    if (!MasterDataService.instance) {
      MasterDataService.instance = new MasterDataService();
    }
    return MasterDataService.instance;
  }

  private async ensureClientSideInit(): Promise<void> {
    if (!this.db && typeof window !== 'undefined') {
      try {
        this.db = DatabaseManager.getInstance();
      } catch (error) {
        this.db = DatabaseManager.getInstance({
          permanent: {
            enabled: false
          },
          temporary: {
            dbName: 'disaster_ops_v3',
            version: 1
          }
        });
      }
      this.setupEventListeners();
    }
    if (!this.db) {
      throw new Error('Database not available on server-side rendering');
    }
  }

  // ============================================
  // OPERATION MANAGEMENT
  // ============================================

  async setCurrentOperation(operationId: string): Promise<void> {
    this.currentOperationId = operationId;
    
    // Emit operation change event
    await eventBus.emit(EventType.ONLINE_MODE, {
      operation_id: operationId,
      timestamp: new Date().toISOString()
    });
  }

  getCurrentOperationId(): string | null {
    return this.currentOperationId;
  }

  async createOperation(operation: Omit<Operation, 'id'>): Promise<string> {
    const id = this.generateId();
    const fullOperation: Operation = {
      ...operation,
      id,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    await this.db.write('operations', 'add', fullOperation);
    await this.emitChange('insert', 'operations', id, null, fullOperation);
    
    return id;
  }

  async getOperations(): Promise<Operation[]> {
    await this.ensureClientSideInit();
    const result = await this.db.query<Operation[]>('operations');
    return result.data || [];
  }

  // ============================================
  // DAILY SCHEDULE - Master Source
  // ============================================

  async getDailySchedule(operationId?: string): Promise<DailyScheduleEntry[]> {
    await this.ensureClientSideInit();
    const opId = operationId || this.currentOperationId;
    if (!opId) throw new Error('No operation context');

    const result = await this.db.query<DailyScheduleEntry[]>('daily_schedule', {
      index: 'operation_id',
      value: opId
    });

    const schedule = result.data || [];
    // Sort by time for consistent display
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }

  async updateDailySchedule(entry: DailyScheduleEntry): Promise<void> {
    const updated = {
      ...entry,
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    // Get old data for change tracking
    const oldResult = await this.db.query<DailyScheduleEntry>('daily_schedule', { id: entry.id });
    const oldData = oldResult.data;

    await this.db.write('daily_schedule', 'put', updated);
    
    // Emit change event for real-time sync
    await this.emitChange('update', 'daily_schedule', entry.id, oldData, updated);
    
    // Notify all listeners
    this.notifyTableListeners('daily_schedule');
    this.notifyRecordListeners(`daily_schedule:${entry.id}`, updated);
  }

  async addDailyScheduleEntry(entry: Omit<DailyScheduleEntry, 'id'>): Promise<string> {
    const id = this.generateId();
    const fullEntry: DailyScheduleEntry = {
      ...entry,
      id,
      operation_id: entry.operation_id || this.currentOperationId!,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    await this.db.write('daily_schedule', 'add', fullEntry);
    await this.emitChange('insert', 'daily_schedule', id, null, fullEntry);
    
    this.notifyTableListeners('daily_schedule');
    return id;
  }

  async deleteDailyScheduleEntry(id: string): Promise<void> {
    const oldResult = await this.db.query<DailyScheduleEntry>('daily_schedule', { id });
    const oldData = oldResult.data;

    await this.db.write('daily_schedule', 'delete', id);
    await this.emitChange('delete', 'daily_schedule', id, oldData, null);
    
    this.notifyTableListeners('daily_schedule');
  }

  // ============================================
  // FACILITIES - Master Source
  // ============================================

  async getFacilities(operationId?: string, facilityType?: string): Promise<Facility[]> {
    const opId = operationId || this.currentOperationId;
    if (!opId) throw new Error('No operation context');

    const params = facilityType 
      ? { index: 'facility_type', value: facilityType }
      : { index: 'operation_id', value: opId };

    const result = await this.db.query<Facility[]>('facilities', params);
    return result.data || [];
  }

  async updateFacility(facility: Facility): Promise<void> {
    const updated = {
      ...facility,
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    const oldResult = await this.db.query<Facility>('facilities', { id: facility.id });
    const oldData = oldResult.data;

    await this.db.write('facilities', 'put', updated);
    await this.emitChange('update', 'facilities', facility.id, oldData, updated);
    
    this.notifyTableListeners('facilities');
    this.notifyRecordListeners(`facility:${facility.id}`, updated);
  }

  async addFacility(facility: Omit<Facility, 'id'>): Promise<string> {
    const id = this.generateId();
    const fullFacility: Facility = {
      ...facility,
      id,
      operation_id: facility.operation_id || this.currentOperationId!,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    await this.db.write('facilities', 'add', fullFacility);
    await this.emitChange('insert', 'facilities', id, null, fullFacility);
    
    this.notifyTableListeners('facilities');
    return id;
  }

  // ============================================
  // PERSONNEL & ASSIGNMENTS - Master Source
  // ============================================

  async getPersonnel(operationId?: string): Promise<Personnel[]> {
    const opId = operationId || this.currentOperationId;
    if (!opId) throw new Error('No operation context');

    const result = await this.db.query<Personnel[]>('personnel', {
      index: 'operation_id',
      value: opId
    });

    return result.data || [];
  }

  async getPersonnelAssignments(operationId?: string, facilityId?: string): Promise<PersonnelAssignment[]> {
    const opId = operationId || this.currentOperationId;
    if (!opId) throw new Error('No operation context');

    const params = facilityId 
      ? { index: 'facility_id', value: facilityId }
      : { index: 'operation_id', value: opId };

    const result = await this.db.query<PersonnelAssignment[]>('personnel_assignments', params);
    return result.data || [];
  }

  async updatePersonnelAssignment(assignment: PersonnelAssignment): Promise<void> {
    const updated = {
      ...assignment,
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    const oldResult = await this.db.query<PersonnelAssignment>('personnel_assignments', { id: assignment.id });
    const oldData = oldResult.data;

    await this.db.write('personnel_assignments', 'put', updated);
    await this.emitChange('update', 'personnel_assignments', assignment.id, oldData, updated);
    
    this.notifyTableListeners('personnel_assignments');
    this.notifyRecordListeners(`assignment:${assignment.id}`, updated);
  }

  // ============================================
  // WORK ASSIGNMENTS - Master Source
  // ============================================

  async getWorkAssignments(operationId?: string, facilityId?: string): Promise<WorkAssignment[]> {
    const opId = operationId || this.currentOperationId;
    if (!opId) throw new Error('No operation context');

    const params = facilityId 
      ? { index: 'facility_id', value: facilityId }
      : { index: 'operation_id', value: opId };

    const result = await this.db.query<WorkAssignment[]>('work_assignments', params);
    return result.data || [];
  }

  async updateWorkAssignment(assignment: WorkAssignment): Promise<void> {
    const updated = {
      ...assignment,
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    const oldResult = await this.db.query<WorkAssignment>('work_assignments', { id: assignment.id });
    const oldData = oldResult.data;

    await this.db.write('work_assignments', 'put', updated);
    await this.emitChange('update', 'work_assignments', assignment.id, oldData, updated);
    
    this.notifyTableListeners('work_assignments');
  }

  async addWorkAssignment(assignment: Omit<WorkAssignment, 'id'>): Promise<string> {
    const id = this.generateId();
    const fullAssignment: WorkAssignment = {
      ...assignment,
      id,
      operation_id: assignment.operation_id || this.currentOperationId!,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    await this.db.write('work_assignments', 'add', fullAssignment);
    await this.emitChange('insert', 'work_assignments', id, null, fullAssignment);
    
    this.notifyTableListeners('work_assignments');
    return id;
  }

  // ============================================
  // GAPS ANALYSIS - Master Source
  // ============================================

  async getGaps(operationId?: string, facilityId?: string, gapType?: string): Promise<Gap[]> {
    const opId = operationId || this.currentOperationId;
    if (!opId) throw new Error('No operation context');

    let params: any;
    if (facilityId) {
      params = { index: 'facility_id', value: facilityId };
    } else if (gapType) {
      params = { index: 'gap_type', value: gapType };
    } else {
      params = { index: 'operation_id', value: opId };
    }

    const result = await this.db.query<Gap[]>('gaps', params);
    return result.data || [];
  }

  async updateGap(gap: Gap): Promise<void> {
    const updated = {
      ...gap,
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    const oldResult = await this.db.query<Gap>('gaps', { id: gap.id });
    const oldData = oldResult.data;

    await this.db.write('gaps', 'put', updated);
    await this.emitChange('update', 'gaps', gap.id, oldData, updated);
    
    this.notifyTableListeners('gaps');
  }

  async addGap(gap: Omit<Gap, 'id'>): Promise<string> {
    const id = this.generateId();
    const fullGap: Gap = {
      ...gap,
      id,
      operation_id: gap.operation_id || this.currentOperationId!,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.getCurrentUserId()
    };

    await this.db.write('gaps', 'add', fullGap);
    await this.emitChange('insert', 'gaps', id, null, fullGap);
    
    this.notifyTableListeners('gaps');
    return id;
  }

  // ============================================
  // REAL-TIME SUBSCRIPTION SYSTEM
  // ============================================

  /**
   * Subscribe to changes in a table
   */
  subscribeToTable(tableName: string, callback: (data: any[]) => void): () => void {
    if (!this.changeListeners.has(tableName)) {
      this.changeListeners.set(tableName, new Set());
    }
    
    this.changeListeners.get(tableName)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.changeListeners.get(tableName)?.delete(callback);
    };
  }

  /**
   * Subscribe to changes in a specific record
   */
  subscribeToRecord(recordKey: string, callback: (record: any) => void): () => void {
    if (!this.recordListeners.has(recordKey)) {
      this.recordListeners.set(recordKey, new Set());
    }
    
    this.recordListeners.get(recordKey)!.add(callback);
    
    return () => {
      this.recordListeners.get(recordKey)?.delete(callback);
    };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private setupEventListeners(): void {
    // Listen to database events and propagate to components
    eventBus.on(EventType.DATA_IMPORTED, (event) => {
      console.log('[MasterDataService] Data change detected:', event);
      
      if (event.payload?.collection) {
        this.notifyTableListeners(event.payload.collection);
      }
    });
  }

  private async emitChange(
    type: 'insert' | 'update' | 'delete',
    table: string, 
    recordId: string, 
    oldData: any, 
    newData: any
  ): Promise<void> {
    const changeEvent: DataChangeEvent = {
      type,
      table,
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      user_id: this.getCurrentUserId(),
      timestamp: new Date(),
      correlation_id: this.generateId()
    };

    // Store change in database for audit
    await this.db.appendEvent({
      id: this.generateId(),
      type: EventType.DATA_IMPORTED,
      payload: changeEvent,
      timestamp: Date.now(),
      sync_status: 'pending'
    });

    // Emit to event bus for real-time propagation
    await eventBus.emit(EventType.DATA_IMPORTED, changeEvent);
  }

  private notifyTableListeners(tableName: string): void {
    const listeners = this.changeListeners.get(tableName);
    if (listeners) {
      // Fetch fresh data and notify all listeners
      this.refreshTableData(tableName).then(data => {
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in table listener for ${tableName}:`, error);
          }
        });
      });
    }
  }

  private notifyRecordListeners(recordKey: string, record: any): void {
    const listeners = this.recordListeners.get(recordKey);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(record);
        } catch (error) {
          console.error(`Error in record listener for ${recordKey}:`, error);
        }
      });
    }
  }

  private async refreshTableData(tableName: string): Promise<any[]> {
    try {
      const result = await this.db.query<any[]>(tableName);
      return result.data || [];
    } catch (error) {
      console.error(`Error refreshing data for ${tableName}:`, error);
      return [];
    }
  }

  private generateId(): string {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private getCurrentUserId(): string {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem('disaster_ops_user_id') || 'anonymous';
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get singleton instance - only creates on client side
 */
export function getMasterDataService(): MasterDataService | null {
  // Prevent SSR issues - only create instance on client side
  if (typeof window === 'undefined') {
    return null;
  }
  return MasterDataService.getInstance();
}

/**
 * Export singleton instance getter - creates only when called on client side
 */
let cachedInstance: MasterDataService | null = null;
export const getMasterDataServiceInstance = (): MasterDataService => {
  if (!cachedInstance) {
    cachedInstance = MasterDataService.getInstance();
  }
  return cachedInstance;
};

/**
 * Initialize master data service with current operation
 */
export async function initializeMasterDataService(operationId: string): Promise<void> {
  const service = getMasterDataService();
  await service.setCurrentOperation(operationId);
  console.log('[MasterDataService] Initialized with operation:', operationId);
}