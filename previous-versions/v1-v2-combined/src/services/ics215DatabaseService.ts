/**
 * ICS 215 Database Service Layer
 * Comprehensive service for operational planning worksheets with real-time collaboration,
 * optimistic updates, automatic saving, and offline support
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import {
  ICS215Worksheet,
  ICS215WorksheetRecord,
  WorkAssignment,
  ResourceRequirement,
  ResourceAllocation,
  ServiceLineAssignment,
  FeedingAssignment,
  ShelteringAssignment,
  MassCareAssignment,
  HealthServicesAssignment,
  RecoveryAssignment,
  LogisticsAssignment,
  CollaborationSession,
  RealtimeChange,
  ChangeConflict,
  ICS215AuditEntry,
  WorksheetSnapshot,
  SyncQueueItem,
  ClientSyncState,
  WorksheetSummary,
  WorksheetFilter,
  PaginationOptions,
  PaginatedResponse,
  CreateWorksheetRequest,
  UpdateWorksheetRequest,
  CreateAssignmentRequest,
  WorksheetEvent,
  SectionType,
  WorksheetStatus,
  ChangeType,
  ConflictResolution,
  ValidationResult,
  ValidationError,
} from '../types/ics-215-types';

// Environment configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Type guards
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

// Create Supabase client
export const supabase: SupabaseClient | null = isConfigured ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 20, // Higher for real-time collaboration
    },
  },
}) : null;

// ==============================================================================
// TYPE CONVERTERS AND UTILITIES
// ==============================================================================

export class TypeConverters {
  static worksheetFromDB(record: ICS215WorksheetRecord): ICS215Worksheet {
    return {
      id: record.id,
      worksheetId: record.worksheet_id,
      operationId: record.operation_id,
      worksheetNumber: record.worksheet_number,
      operationalPeriodStart: new Date(record.operational_period_start),
      operationalPeriodEnd: new Date(record.operational_period_end),
      incidentName: record.incident_name,
      incidentNumber: record.incident_number,
      preparedBy: record.prepared_by,
      preparedDate: new Date(record.prepared_date),
      sectionType: record.section_type as SectionType,
      branch: record.branch,
      division: record.division,
      groupAssignment: record.group_assignment,
      status: record.status as WorksheetStatus,
      priorityLevel: record.priority_level as 1 | 2 | 3 | 4 | 5,
      missionStatement: record.mission_statement,
      situationSummary: record.situation_summary,
      executionSummary: record.execution_summary,
      specialInstructions: record.special_instructions,
      versionNumber: record.version_number,
      parentVersionId: record.parent_version_id,
      isCurrentVersion: record.is_current_version,
      lockedBy: record.locked_by,
      lockedAt: record.locked_at ? new Date(record.locked_at) : undefined,
      lockExpiresAt: record.lock_expires_at ? new Date(record.lock_expires_at) : undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
      createdBy: record.created_by,
      updatedBy: record.updated_by,
    };
  }

  static worksheetToDB(worksheet: Partial<ICS215Worksheet>): Partial<ICS215WorksheetRecord> {
    const record: Partial<ICS215WorksheetRecord> = {};

    if (worksheet.id) record.id = worksheet.id;
    if (worksheet.worksheetId) record.worksheet_id = worksheet.worksheetId;
    if (worksheet.operationId) record.operation_id = worksheet.operationId;
    if (worksheet.worksheetNumber) record.worksheet_number = worksheet.worksheetNumber;
    if (worksheet.operationalPeriodStart) record.operational_period_start = worksheet.operationalPeriodStart.toISOString();
    if (worksheet.operationalPeriodEnd) record.operational_period_end = worksheet.operationalPeriodEnd.toISOString();
    if (worksheet.incidentName) record.incident_name = worksheet.incidentName;
    if (worksheet.incidentNumber) record.incident_number = worksheet.incidentNumber;
    if (worksheet.preparedBy) record.prepared_by = worksheet.preparedBy;
    if (worksheet.preparedDate) record.prepared_date = worksheet.preparedDate.toISOString();
    if (worksheet.sectionType) record.section_type = worksheet.sectionType;
    if (worksheet.branch) record.branch = worksheet.branch;
    if (worksheet.division) record.division = worksheet.division;
    if (worksheet.groupAssignment) record.group_assignment = worksheet.groupAssignment;
    if (worksheet.status) record.status = worksheet.status;
    if (worksheet.priorityLevel) record.priority_level = worksheet.priorityLevel;
    if (worksheet.missionStatement) record.mission_statement = worksheet.missionStatement;
    if (worksheet.situationSummary) record.situation_summary = worksheet.situationSummary;
    if (worksheet.executionSummary) record.execution_summary = worksheet.executionSummary;
    if (worksheet.specialInstructions) record.special_instructions = worksheet.specialInstructions;
    if (worksheet.versionNumber) record.version_number = worksheet.versionNumber;
    if (worksheet.parentVersionId) record.parent_version_id = worksheet.parentVersionId;
    if (worksheet.isCurrentVersion !== undefined) record.is_current_version = worksheet.isCurrentVersion;
    if (worksheet.lockedBy) record.locked_by = worksheet.lockedBy;
    if (worksheet.lockedAt) record.locked_at = worksheet.lockedAt.toISOString();
    if (worksheet.lockExpiresAt) record.lock_expires_at = worksheet.lockExpiresAt.toISOString();
    if (worksheet.createdBy) record.created_by = worksheet.createdBy;
    if (worksheet.updatedBy) record.updated_by = worksheet.updatedBy;

    return record;
  }
}

// ==============================================================================
// VALIDATION SYSTEM
// ==============================================================================

export class ValidationService {
  static validateWorksheet(worksheet: Partial<ICS215Worksheet>): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!worksheet.operationId) {
      errors.push({ field: 'operationId', message: 'Operation ID is required', code: 'REQUIRED' });
    }

    if (!worksheet.incidentName) {
      errors.push({ field: 'incidentName', message: 'Incident name is required', code: 'REQUIRED' });
    }

    if (!worksheet.preparedBy) {
      errors.push({ field: 'preparedBy', message: 'Prepared by is required', code: 'REQUIRED' });
    }

    if (!worksheet.sectionType) {
      errors.push({ field: 'sectionType', message: 'Section type is required', code: 'REQUIRED' });
    }

    if (!worksheet.operationalPeriodStart) {
      errors.push({ field: 'operationalPeriodStart', message: 'Operational period start is required', code: 'REQUIRED' });
    }

    if (!worksheet.operationalPeriodEnd) {
      errors.push({ field: 'operationalPeriodEnd', message: 'Operational period end is required', code: 'REQUIRED' });
    }

    // Date validation
    if (worksheet.operationalPeriodStart && worksheet.operationalPeriodEnd) {
      if (worksheet.operationalPeriodStart >= worksheet.operationalPeriodEnd) {
        errors.push({ 
          field: 'operationalPeriodEnd', 
          message: 'Operational period end must be after start', 
          code: 'INVALID_RANGE' 
        });
      }

      const duration = worksheet.operationalPeriodEnd.getTime() - worksheet.operationalPeriodStart.getTime();
      const hours = duration / (1000 * 60 * 60);
      
      if (hours > 24) {
        errors.push({ 
          field: 'operationalPeriodEnd', 
          message: 'Operational period cannot exceed 24 hours', 
          code: 'DURATION_EXCEEDED' 
        });
      }

      if (hours < 1) {
        errors.push({ 
          field: 'operationalPeriodEnd', 
          message: 'Operational period must be at least 1 hour', 
          code: 'DURATION_TOO_SHORT' 
        });
      }
    }

    // Length validation
    if (worksheet.incidentName && worksheet.incidentName.length > 255) {
      errors.push({ 
        field: 'incidentName', 
        message: 'Incident name cannot exceed 255 characters', 
        code: 'MAX_LENGTH' 
      });
    }

    if (worksheet.missionStatement && worksheet.missionStatement.length > 2000) {
      errors.push({ 
        field: 'missionStatement', 
        message: 'Mission statement cannot exceed 2000 characters', 
        code: 'MAX_LENGTH' 
      });
    }

    if (worksheet.situationSummary && worksheet.situationSummary.length > 5000) {
      errors.push({ 
        field: 'situationSummary', 
        message: 'Situation summary cannot exceed 5000 characters', 
        code: 'MAX_LENGTH' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateWorkAssignment(assignment: Partial<WorkAssignment>): ValidationResult {
    const errors: ValidationError[] = [];

    if (!assignment.worksheetId) {
      errors.push({ field: 'worksheetId', message: 'Worksheet ID is required', code: 'REQUIRED' });
    }

    if (!assignment.assignmentNumber) {
      errors.push({ field: 'assignmentNumber', message: 'Assignment number is required', code: 'REQUIRED' });
    }

    if (!assignment.taskName) {
      errors.push({ field: 'taskName', message: 'Task name is required', code: 'REQUIRED' });
    }

    if (!assignment.assignedToPosition) {
      errors.push({ field: 'assignedToPosition', message: 'Assigned to position is required', code: 'REQUIRED' });
    }

    if (!assignment.reportTime) {
      errors.push({ field: 'reportTime', message: 'Report time is required', code: 'REQUIRED' });
    }

    // Length validations
    if (assignment.taskName && assignment.taskName.length > 255) {
      errors.push({ 
        field: 'taskName', 
        message: 'Task name cannot exceed 255 characters', 
        code: 'MAX_LENGTH' 
      });
    }

    if (assignment.taskDescription && assignment.taskDescription.length > 2000) {
      errors.push({ 
        field: 'taskDescription', 
        message: 'Task description cannot exceed 2000 characters', 
        code: 'MAX_LENGTH' 
      });
    }

    // Range validations
    if (assignment.priority && (assignment.priority < 1 || assignment.priority > 5)) {
      errors.push({ 
        field: 'priority', 
        message: 'Priority must be between 1 and 5', 
        code: 'INVALID_RANGE' 
      });
    }

    if (assignment.progressPercentage !== undefined && 
        (assignment.progressPercentage < 0 || assignment.progressPercentage > 100)) {
      errors.push({ 
        field: 'progressPercentage', 
        message: 'Progress percentage must be between 0 and 100', 
        code: 'INVALID_RANGE' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// ==============================================================================
// OPTIMISTIC UPDATE MANAGER
// ==============================================================================

export class OptimisticUpdateManager {
  private pendingUpdates: Map<string, { data: any; timestamp: Date }> = new Map();
  private retryQueue: Array<{ id: string; operation: () => Promise<any>; attempts: number }> = [];

  addPendingUpdate(id: string, data: any): void {
    this.pendingUpdates.set(id, { data, timestamp: new Date() });
  }

  removePendingUpdate(id: string): void {
    this.pendingUpdates.delete(id);
  }

  getPendingUpdate(id: string): any | null {
    const update = this.pendingUpdates.get(id);
    return update ? update.data : null;
  }

  getAllPendingUpdates(): Array<{ id: string; data: any; timestamp: Date }> {
    return Array.from(this.pendingUpdates.entries()).map(([id, update]) => ({
      id,
      ...update,
    }));
  }

  addToRetryQueue(id: string, operation: () => Promise<any>): void {
    this.retryQueue.push({ id, operation, attempts: 0 });
  }

  async processRetryQueue(): Promise<void> {
    const maxAttempts = 3;
    const retryDelay = 1000; // 1 second

    while (this.retryQueue.length > 0) {
      const item = this.retryQueue.shift()!;
      
      try {
        await item.operation();
        this.removePendingUpdate(item.id);
      } catch (error) {
        item.attempts++;
        
        if (item.attempts < maxAttempts) {
          // Add back to queue with delay
          setTimeout(() => {
            this.retryQueue.push(item);
          }, retryDelay * item.attempts);
        } else {
          console.error(`Failed to sync update after ${maxAttempts} attempts:`, error);
          this.removePendingUpdate(item.id);
        }
      }
    }
  }

  clearExpiredUpdates(maxAge: number = 300000): void { // 5 minutes
    const now = new Date();
    
    for (const [id, update] of this.pendingUpdates.entries()) {
      if (now.getTime() - update.timestamp.getTime() > maxAge) {
        this.pendingUpdates.delete(id);
      }
    }
  }
}

// ==============================================================================
// DEBOUNCED AUTO-SAVE MANAGER
// ==============================================================================

export class AutoSaveManager {
  private saveTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay: number;

  constructor(debounceDelay: number = 2000) {
    this.debounceDelay = debounceDelay;
  }

  scheduleSave(key: string, saveOperation: () => Promise<void>): void {
    // Clear existing timeout
    const existingTimeout = this.saveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new save
    const timeout = setTimeout(async () => {
      try {
        await saveOperation();
        this.saveTimeouts.delete(key);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Could implement retry logic here
      }
    }, this.debounceDelay);

    this.saveTimeouts.set(key, timeout);
  }

  cancelSave(key: string): void {
    const timeout = this.saveTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.saveTimeouts.delete(key);
    }
  }

  flushSave(key: string): void {
    const timeout = this.saveTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.saveTimeouts.delete(key);
      // Execute save immediately - would need to store the operation
    }
  }

  cancelAllSaves(): void {
    for (const timeout of this.saveTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.saveTimeouts.clear();
  }
}

// ==============================================================================
// MAIN DATABASE SERVICE
// ==============================================================================

export class ICS215DatabaseService {
  private static instance: ICS215DatabaseService;
  private optimisticUpdates = new OptimisticUpdateManager();
  private autoSave = new AutoSaveManager();
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();
  private clientId = nanoid();

  private constructor() {}

  static getInstance(): ICS215DatabaseService {
    if (!ICS215DatabaseService.instance) {
      ICS215DatabaseService.instance = new ICS215DatabaseService();
    }
    return ICS215DatabaseService.instance;
  }

  // ==============================================================================
  // WORKSHEET MANAGEMENT
  // ==============================================================================

  async createWorksheet(request: CreateWorksheetRequest): Promise<ICS215Worksheet | null> {
    if (!supabase) return null;

    const validation = ValidationService.validateWorksheet(request);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const worksheetId = `ICS-215-${request.operationId}-${request.sectionType}-${Date.now()}`;
    const worksheet: Partial<ICS215Worksheet> = {
      id: nanoid(),
      worksheetId,
      ...request,
      preparedDate: new Date(),
      status: 'draft',
      priorityLevel: 3,
      versionNumber: 1,
      isCurrentVersion: true,
    };

    try {
      const dbRecord = TypeConverters.worksheetToDB(worksheet);
      
      const { data, error } = await supabase
        .from('ics_215_worksheets')
        .insert(dbRecord)
        .select()
        .single();

      if (error) throw error;
      
      const result = TypeConverters.worksheetFromDB(data);
      
      // Initialize collaboration session
      await this.initializeCollaborationSession(result.id);
      
      return result;
    } catch (error) {
      console.error('Error creating worksheet:', error);
      throw error;
    }
  }

  async getWorksheet(id: string): Promise<ICS215Worksheet | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('ics_215_worksheets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return TypeConverters.worksheetFromDB(data);
    } catch (error) {
      console.error('Error fetching worksheet:', error);
      return null;
    }
  }

  async updateWorksheet(
    id: string, 
    updates: UpdateWorksheetRequest, 
    optimistic = true
  ): Promise<ICS215Worksheet | null> {
    if (!supabase) return null;

    const validation = ValidationService.validateWorksheet(updates);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    if (optimistic) {
      // Apply optimistic update immediately
      this.optimisticUpdates.addPendingUpdate(id, updates);
      
      // Schedule auto-save
      this.autoSave.scheduleSave(`worksheet-${id}`, async () => {
        await this.performWorksheetUpdate(id, updates);
      });

      // Return optimistic result
      const current = await this.getWorksheet(id);
      if (current) {
        return { ...current, ...updates, updatedAt: new Date() };
      }
    }

    return await this.performWorksheetUpdate(id, updates);
  }

  private async performWorksheetUpdate(
    id: string, 
    updates: UpdateWorksheetRequest
  ): Promise<ICS215Worksheet | null> {
    if (!supabase) return null;

    try {
      const dbUpdates = TypeConverters.worksheetToDB(updates);
      
      const { data, error } = await supabase
        .from('ics_215_worksheets')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      this.optimisticUpdates.removePendingUpdate(id);
      return TypeConverters.worksheetFromDB(data);
    } catch (error) {
      console.error('Error updating worksheet:', error);
      
      // Add to retry queue for optimistic updates
      this.optimisticUpdates.addToRetryQueue(id, () => 
        this.performWorksheetUpdate(id, updates)
      );
      
      throw error;
    }
  }

  async deleteWorksheet(id: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('ics_215_worksheets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Clean up collaboration
      await this.endCollaborationSession(id);
      
      return true;
    } catch (error) {
      console.error('Error deleting worksheet:', error);
      return false;
    }
  }

  async listWorksheets(
    filter: WorksheetFilter = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<WorksheetSummary>> {
    if (!supabase) return { data: [], total: 0, page: 1, limit: 50, hasMore: false };

    try {
      let query = supabase
        .from('active_215_worksheets')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.operationId) {
        query = query.eq('operation_id', filter.operationId);
      }

      if (filter.sectionType) {
        query = query.eq('section_type', filter.sectionType);
      }

      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }

      if (filter.dateRange) {
        query = query
          .gte('operational_period_start', filter.dateRange.start.toISOString())
          .lte('operational_period_start', filter.dateRange.end.toISOString());
      }

      if (filter.search) {
        query = query.or(`incident_name.ilike.%${filter.search}%,mission_statement.ilike.%${filter.search}%`);
      }

      // Apply pagination and sorting
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      
      query = query.range(from, to);
      
      if (pagination.sortBy) {
        query = query.order(pagination.sortBy, { ascending: pagination.sortOrder === 'asc' });
      } else {
        query = query.order('operational_period_start', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const worksheets = (data || []).map(record => ({
        worksheetId: record.worksheet_id,
        worksheetNumber: record.worksheet_number,
        sectionType: record.section_type,
        operationName: record.operation_name,
        operationState: record.operation_state,
        totalAssignments: record.total_assignments || 0,
        completedAssignments: record.completed_assignments || 0,
        totalResources: record.total_resources || 0,
        fulfilledResources: record.fulfilled_resources || 0,
        activeCollaborators: record.active_collaborators || 0,
        status: record.status,
        operationalPeriodStart: new Date(record.operational_period_start),
        operationalPeriodEnd: new Date(record.operational_period_end),
      }));

      return {
        data: worksheets,
        total: count || 0,
        page: pagination.page,
        limit: pagination.limit,
        hasMore: (count || 0) > pagination.page * pagination.limit,
      };
    } catch (error) {
      console.error('Error listing worksheets:', error);
      return { data: [], total: 0, page: 1, limit: 50, hasMore: false };
    }
  }

  // ==============================================================================
  // WORK ASSIGNMENTS
  // ==============================================================================

  async createWorkAssignment(assignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkAssignment | null> {
    if (!supabase) return null;

    const validation = ValidationService.validateWorkAssignment(assignment);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    try {
      const { data, error } = await supabase
        .from('work_assignments')
        .insert({
          id: nanoid(),
          ...assignment,
          progress_percentage: assignment.progressPercentage || 0,
          status: assignment.status || 'assigned',
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        worksheetId: data.worksheet_id,
        assignmentNumber: data.assignment_number,
        taskName: data.task_name,
        taskDescription: data.task_description,
        assignedToPosition: data.assigned_to_position,
        assignedToPerson: data.assigned_to_person,
        supervisorPosition: data.supervisor_position,
        supervisorPerson: data.supervisor_person,
        workLocation: data.work_location,
        reportTime: new Date(data.report_time),
        expectedDuration: data.expected_duration,
        completionDeadline: data.completion_deadline ? new Date(data.completion_deadline) : undefined,
        taskCategory: data.task_category,
        priority: data.priority,
        difficultyLevel: data.difficulty_level,
        personnelRequired: data.personnel_required,
        equipmentRequired: data.equipment_required || [],
        materialsRequired: data.materials_required || [],
        specialSkills: data.special_skills || [],
        safetyRequirements: data.safety_requirements,
        environmentalConcerns: data.environmental_concerns,
        accessRestrictions: data.access_restrictions,
        status: data.status,
        progressPercentage: data.progress_percentage,
        estimatedCompletion: data.estimated_completion ? new Date(data.estimated_completion) : undefined,
        actualCompletion: data.actual_completion ? new Date(data.actual_completion) : undefined,
        completionNotes: data.completion_notes,
        challengesEncountered: data.challenges_encountered,
        timeActual: data.time_actual,
        resourcesActual: data.resources_actual,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error creating work assignment:', error);
      throw error;
    }
  }

  async updateWorkAssignment(
    id: string, 
    updates: Partial<WorkAssignment>
  ): Promise<WorkAssignment | null> {
    if (!supabase) return null;

    try {
      const dbUpdates: any = {};
      
      if (updates.taskName) dbUpdates.task_name = updates.taskName;
      if (updates.taskDescription) dbUpdates.task_description = updates.taskDescription;
      if (updates.assignedToPerson) dbUpdates.assigned_to_person = updates.assignedToPerson;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.progressPercentage !== undefined) dbUpdates.progress_percentage = updates.progressPercentage;
      if (updates.estimatedCompletion) dbUpdates.estimated_completion = updates.estimatedCompletion.toISOString();
      if (updates.actualCompletion) dbUpdates.actual_completion = updates.actualCompletion.toISOString();
      if (updates.completionNotes) dbUpdates.completion_notes = updates.completionNotes;
      if (updates.challengesEncountered) dbUpdates.challenges_encountered = updates.challengesEncountered;

      const { data, error } = await supabase
        .from('work_assignments')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert back to frontend format (would need full converter function)
      return this.convertWorkAssignmentFromDB(data);
    } catch (error) {
      console.error('Error updating work assignment:', error);
      throw error;
    }
  }

  private convertWorkAssignmentFromDB(data: any): WorkAssignment {
    return {
      id: data.id,
      worksheetId: data.worksheet_id,
      assignmentNumber: data.assignment_number,
      taskName: data.task_name,
      taskDescription: data.task_description,
      assignedToPosition: data.assigned_to_position,
      assignedToPerson: data.assigned_to_person,
      supervisorPosition: data.supervisor_position,
      supervisorPerson: data.supervisor_person,
      workLocation: data.work_location,
      reportTime: new Date(data.report_time),
      expectedDuration: data.expected_duration,
      completionDeadline: data.completion_deadline ? new Date(data.completion_deadline) : undefined,
      taskCategory: data.task_category,
      priority: data.priority,
      difficultyLevel: data.difficulty_level,
      personnelRequired: data.personnel_required,
      equipmentRequired: data.equipment_required || [],
      materialsRequired: data.materials_required || [],
      specialSkills: data.special_skills || [],
      safetyRequirements: data.safety_requirements,
      environmentalConcerns: data.environmental_concerns,
      accessRestrictions: data.access_restrictions,
      status: data.status,
      progressPercentage: data.progress_percentage,
      estimatedCompletion: data.estimated_completion ? new Date(data.estimated_completion) : undefined,
      actualCompletion: data.actual_completion ? new Date(data.actual_completion) : undefined,
      completionNotes: data.completion_notes,
      challengesEncountered: data.challenges_encountered,
      timeActual: data.time_actual,
      resourcesActual: data.resources_actual,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getWorksheetAssignments(worksheetId: string): Promise<WorkAssignment[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('work_assignments')
        .select('*')
        .eq('worksheet_id', worksheetId)
        .order('assignment_number');

      if (error) throw error;

      return (data || []).map(this.convertWorkAssignmentFromDB);
    } catch (error) {
      console.error('Error fetching worksheet assignments:', error);
      return [];
    }
  }

  // ==============================================================================
  // SERVICE LINE ASSIGNMENTS
  // ==============================================================================

  async createServiceLineAssignment(
    type: 'feeding' | 'sheltering' | 'mass_care' | 'health_services' | 'recovery' | 'logistics',
    assignment: CreateAssignmentRequest
  ): Promise<ServiceLineAssignment | null> {
    if (!supabase) return null;

    const tableName = `${type}_assignments`;
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          id: nanoid(),
          worksheet_id: assignment.worksheetId,
          assignment_name: assignment.assignmentName,
          assignment_type: assignment.assignmentType,
          status: 'planned',
          progress_percentage: 0,
          ...assignment,
        })
        .select()
        .single();

      if (error) throw error;
      
      return this.convertServiceLineAssignmentFromDB(type, data);
    } catch (error) {
      console.error('Error creating service line assignment:', error);
      throw error;
    }
  }

  private convertServiceLineAssignmentFromDB(
    type: string, 
    data: any
  ): ServiceLineAssignment {
    const base = {
      id: data.id,
      worksheetId: data.worksheet_id,
      assignmentName: data.assignment_name,
      status: data.status,
      progressPercentage: data.progress_percentage || 0,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    switch (type) {
      case 'feeding':
        return {
          ...base,
          assignmentType: data.assignment_type,
          locationName: data.location_name,
          address: data.address,
          coordinates: data.coordinates ? { lat: data.coordinates.x, lng: data.coordinates.y } : undefined,
          startTime: data.start_time ? new Date(data.start_time) : undefined,
          endTime: data.end_time ? new Date(data.end_time) : undefined,
          targetMeals: data.target_meals || 0,
          estimatedClients: data.estimated_clients || 0,
          mealTypes: data.meal_types || [],
          staffRequired: data.staff_required || 0,
          volunteersRequired: data.volunteers_required || 0,
          ervRequired: data.erv_required || false,
          specialEquipment: data.special_equipment || [],
          teamLeader: data.team_leader,
          assignedStaff: data.assigned_staff || [],
          assignedVolunteers: data.assigned_volunteers || [],
          challenges: data.challenges,
          lessonsLearned: data.lessons_learned,
        } as FeedingAssignment;
      
      // Add other service line conversions...
      default:
        return base as ServiceLineAssignment;
    }
  }

  // ==============================================================================
  // REAL-TIME COLLABORATION
  // ==============================================================================

  async initializeCollaborationSession(worksheetId: string): Promise<CollaborationSession | null> {
    if (!supabase) return null;

    const sessionId = nanoid();
    const userId = await this.getCurrentUserId();
    const userName = await this.getCurrentUserName();

    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          id: nanoid(),
          worksheet_id: worksheetId,
          session_id: sessionId,
          user_id: userId,
          user_name: userName,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Subscribe to real-time changes
      await this.subscribeToWorksheetChanges(worksheetId);

      return {
        id: data.id,
        worksheetId: data.worksheet_id,
        sessionId: data.session_id,
        userId: data.user_id,
        userName: data.user_name,
        userRole: data.user_role,
        startedAt: new Date(data.started_at),
        lastActivity: new Date(data.last_activity),
        status: data.status,
        editingSection: data.editing_section,
        cursorPosition: data.cursor_position,
        selectionRange: data.selection_range,
        connectionId: data.connection_id,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error initializing collaboration session:', error);
      return null;
    }
  }

  async endCollaborationSession(worksheetId: string): Promise<void> {
    if (!supabase) return;

    const userId = await this.getCurrentUserId();

    try {
      await supabase
        .from('collaboration_sessions')
        .update({ status: 'disconnected' })
        .eq('worksheet_id', worksheetId)
        .eq('user_id', userId);

      // Unsubscribe from real-time changes
      this.unsubscribeFromWorksheetChanges(worksheetId);
    } catch (error) {
      console.error('Error ending collaboration session:', error);
    }
  }

  subscribeToWorksheetChanges(
    worksheetId: string,
    callback?: (event: WorksheetEvent) => void
  ): void {
    if (!supabase) return;

    const channelName = `worksheet-${worksheetId}`;
    
    if (this.realtimeChannels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ics_215_worksheets',
          filter: `id=eq.${worksheetId}`,
        },
        (payload) => {
          if (callback) {
            const event: WorksheetEvent = this.createWorksheetEvent(payload);
            callback(event);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_assignments',
          filter: `worksheet_id=eq.${worksheetId}`,
        },
        (payload) => {
          if (callback) {
            const event: WorksheetEvent = this.createAssignmentEvent(payload);
            callback(event);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_sessions',
          filter: `worksheet_id=eq.${worksheetId}`,
        },
        (payload) => {
          if (callback) {
            const event: WorksheetEvent = this.createCollaborationEvent(payload);
            callback(event);
          }
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelName, channel);
  }

  unsubscribeFromWorksheetChanges(worksheetId: string): void {
    if (!supabase) return;

    const channelName = `worksheet-${worksheetId}`;
    const channel = this.realtimeChannels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.realtimeChannels.delete(channelName);
    }
  }

  private createWorksheetEvent(payload: any): WorksheetEvent {
    switch (payload.eventType) {
      case 'INSERT':
        return {
          type: 'worksheet_created',
          data: TypeConverters.worksheetFromDB(payload.new),
        };
      case 'UPDATE':
        return {
          type: 'worksheet_updated',
          data: { id: payload.new.id, ...payload.new },
        };
      case 'DELETE':
        return {
          type: 'worksheet_deleted',
          data: { id: payload.old.id },
        };
      default:
        throw new Error(`Unknown event type: ${payload.eventType}`);
    }
  }

  private createAssignmentEvent(payload: any): WorksheetEvent {
    switch (payload.eventType) {
      case 'INSERT':
        return {
          type: 'assignment_created',
          data: this.convertWorkAssignmentFromDB(payload.new) as ServiceLineAssignment,
        };
      case 'UPDATE':
        return {
          type: 'assignment_updated',
          data: { id: payload.new.id, ...payload.new },
        };
      case 'DELETE':
        return {
          type: 'assignment_deleted',
          data: { id: payload.old.id },
        };
      default:
        throw new Error(`Unknown event type: ${payload.eventType}`);
    }
  }

  private createCollaborationEvent(payload: any): WorksheetEvent {
    switch (payload.eventType) {
      case 'INSERT':
        return {
          type: 'collaboration_started',
          data: {
            id: payload.new.id,
            worksheetId: payload.new.worksheet_id,
            sessionId: payload.new.session_id,
            userId: payload.new.user_id,
            userName: payload.new.user_name,
            userRole: payload.new.user_role,
            startedAt: new Date(payload.new.started_at),
            lastActivity: new Date(payload.new.last_activity),
            status: payload.new.status,
            editingSection: payload.new.editing_section,
            cursorPosition: payload.new.cursor_position,
            selectionRange: payload.new.selection_range,
            connectionId: payload.new.connection_id,
            ipAddress: payload.new.ip_address,
            userAgent: payload.new.user_agent,
            createdAt: new Date(payload.new.created_at),
            updatedAt: new Date(payload.new.updated_at),
          },
        };
      case 'UPDATE':
        if (payload.new.status === 'disconnected') {
          return {
            type: 'collaboration_ended',
            data: { sessionId: payload.new.session_id },
          };
        }
        return {
          type: 'collaboration_started', // Fallback
          data: payload.new,
        };
      default:
        throw new Error(`Unknown event type: ${payload.eventType}`);
    }
  }

  // ==============================================================================
  // VERSIONING AND SNAPSHOTS
  // ==============================================================================

  async createWorksheetVersion(
    worksheetId: string,
    description?: string
  ): Promise<WorksheetSnapshot | null> {
    if (!supabase) return null;

    try {
      // Get current worksheet data
      const worksheet = await this.getWorksheet(worksheetId);
      if (!worksheet) throw new Error('Worksheet not found');

      // Get related data
      const [assignments, resources, workAssignments] = await Promise.all([
        this.getServiceLineAssignments(worksheetId),
        this.getResourceRequirements(worksheetId),
        this.getWorksheetAssignments(worksheetId),
      ]);

      // Create snapshot
      const { data, error } = await supabase
        .from('worksheet_snapshots')
        .insert({
          id: nanoid(),
          worksheet_id: worksheetId,
          version_number: worksheet.versionNumber,
          snapshot_type: 'manual',
          worksheet_data: worksheet,
          assignments_data: assignments,
          resources_data: resources,
          work_assignments_data: workAssignments,
          created_by: await this.getCurrentUserId(),
          description,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        worksheetId: data.worksheet_id,
        versionNumber: data.version_number,
        snapshotType: data.snapshot_type,
        worksheetData: data.worksheet_data,
        assignmentsData: data.assignments_data,
        resourcesData: data.resources_data,
        workAssignmentsData: data.work_assignments_data,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        description: data.description,
      };
    } catch (error) {
      console.error('Error creating worksheet version:', error);
      return null;
    }
  }

  async restoreWorksheetVersion(snapshotId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      // Get snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('worksheet_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .single();

      if (snapshotError || !snapshot) throw new Error('Snapshot not found');

      // Create new version with incremented version number
      const currentWorksheet = await this.getWorksheet(snapshot.worksheet_id);
      if (!currentWorksheet) throw new Error('Current worksheet not found');

      const restoredWorksheet = {
        ...snapshot.worksheet_data,
        versionNumber: currentWorksheet.versionNumber + 1,
        parentVersionId: currentWorksheet.id,
        updatedBy: await this.getCurrentUserId(),
      };

      // Update worksheet
      await this.updateWorksheet(snapshot.worksheet_id, restoredWorksheet, false);

      return true;
    } catch (error) {
      console.error('Error restoring worksheet version:', error);
      return false;
    }
  }

  // ==============================================================================
  // OFFLINE SYNC SUPPORT
  // ==============================================================================

  async queueOfflineChange(
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    tableName: string,
    recordId: string,
    data: any
  ): Promise<void> {
    if (!supabase) return;

    try {
      await supabase
        .from('sync_queue')
        .insert({
          id: nanoid(),
          operation_type: operation,
          table_name: tableName,
          record_id: recordId,
          data_payload: data,
          client_id: this.clientId,
          client_timestamp: new Date().toISOString(),
          sync_status: 'pending',
        });
    } catch (error) {
      console.error('Error queuing offline change:', error);
    }
  }

  async processSyncQueue(): Promise<number> {
    if (!supabase) return 0;

    try {
      const { data: queueItems, error } = await supabase
        .from('sync_queue')
        .select('*')
        .eq('client_id', this.clientId)
        .eq('sync_status', 'pending')
        .order('client_timestamp');

      if (error || !queueItems) return 0;

      let processedCount = 0;

      for (const item of queueItems) {
        try {
          await this.processSyncItem(item);
          processedCount++;
        } catch (error) {
          console.error('Error processing sync item:', error);
          
          // Mark as failed
          await supabase
            .from('sync_queue')
            .update({
              sync_status: 'failed',
              error_message: error instanceof Error ? error.message : String(error),
              attempt_count: (item.attempt_count || 0) + 1,
            })
            .eq('id', item.id);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing sync queue:', error);
      return 0;
    }
  }

  private async processSyncItem(item: any): Promise<void> {
    if (!supabase) return;

    const { operation_type, table_name, record_id, data_payload } = item;

    switch (operation_type) {
      case 'INSERT':
        await supabase.from(table_name).insert(data_payload);
        break;
      case 'UPDATE':
        await supabase.from(table_name).update(data_payload).eq('id', record_id);
        break;
      case 'DELETE':
        await supabase.from(table_name).delete().eq('id', record_id);
        break;
    }

    // Mark as synced
    await supabase
      .from('sync_queue')
      .update({ sync_status: 'synced' })
      .eq('id', item.id);
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private async getCurrentUserId(): Promise<string> {
    if (!supabase) return 'anonymous';
    
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || 'anonymous';
  }

  private async getCurrentUserName(): Promise<string> {
    if (!supabase) return 'Anonymous User';
    
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.full_name || user?.email || 'Anonymous User';
  }

  private async getServiceLineAssignments(worksheetId: string): Promise<ServiceLineAssignment[]> {
    // Placeholder - would implement actual service line assignment fetching
    return [];
  }

  private async getResourceRequirements(worksheetId: string): Promise<ResourceRequirement[]> {
    // Placeholder - would implement actual resource requirement fetching
    return [];
  }

  // Cleanup methods
  cleanup(): void {
    this.autoSave.cancelAllSaves();
    for (const channel of this.realtimeChannels.values()) {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    }
    this.realtimeChannels.clear();
  }
}

// Export singleton instance
export const ics215Service = ICS215DatabaseService.getInstance();

// Export individual classes for testing
export { OptimisticUpdateManager, AutoSaveManager, ValidationService, TypeConverters };