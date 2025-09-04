/**
 * Conflict Resolution Service
 * Handles concurrent editing conflicts, operational transformation, and merge resolution
 * for real-time collaboration in ICS 215 worksheets
 */

import { nanoid } from 'nanoid';
import {
  ICS215Worksheet,
  RealtimeChange,
  ChangeConflict,
  ChangeType,
  ConflictType,
  ResolutionStatus,
  ResolutionMethod,
  ConflictResolution,
} from '../types/ics-215-types';
import { supabase } from './ics215DatabaseService';

// ==============================================================================
// OPERATIONAL TRANSFORMATION TYPES
// ==============================================================================

export interface Operation {
  id: string;
  type: ChangeType;
  path: string; // JSON path to the field
  position?: number;
  length?: number;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  userId: string;
  sessionId: string;
}

export interface TransformResult {
  transformedOperation: Operation;
  conflictDetected: boolean;
  conflictType?: ConflictType;
  requiresManualResolution?: boolean;
}

export interface MergeStrategy {
  name: string;
  canHandle: (conflict: ChangeConflict) => boolean;
  resolve: (conflict: ChangeConflict, operations: Operation[]) => Promise<any>;
  priority: number; // Higher priority strategies are tried first
}

// ==============================================================================
// OPERATIONAL TRANSFORMATION ENGINE
// ==============================================================================

export class OperationalTransformation {
  /**
   * Transforms an operation against another operation that was applied before it
   */
  static transform(operation: Operation, against: Operation): TransformResult {
    // If operations are on different paths, no conflict
    if (operation.path !== against.path) {
      return {
        transformedOperation: operation,
        conflictDetected: false,
      };
    }

    // Handle different operation types
    const conflictType = this.detectConflictType(operation, against);
    
    if (conflictType) {
      return {
        transformedOperation: operation,
        conflictDetected: true,
        conflictType,
        requiresManualResolution: this.requiresManualResolution(operation, against),
      };
    }

    // Transform the operation
    const transformedOperation = this.applyTransformation(operation, against);

    return {
      transformedOperation,
      conflictDetected: false,
    };
  }

  private static detectConflictType(op1: Operation, op2: Operation): ConflictType | null {
    // Same path, different values = concurrent edit
    if (op1.path === op2.path && op1.newValue !== op2.newValue) {
      return 'concurrent_edit';
    }

    // Operations on the same field within a short time window
    const timeDiff = Math.abs(op1.timestamp.getTime() - op2.timestamp.getTime());
    if (timeDiff < 5000 && op1.path === op2.path) { // 5 second window
      return 'concurrent_edit';
    }

    return null;
  }

  private static requiresManualResolution(op1: Operation, op2: Operation): boolean {
    // Complex objects always require manual resolution
    if (typeof op1.newValue === 'object' || typeof op2.newValue === 'object') {
      return true;
    }

    // Critical fields require manual resolution
    const criticalFields = [
      'status',
      'priorityLevel',
      'operationalPeriodStart',
      'operationalPeriodEnd',
      'missionStatement',
    ];

    return criticalFields.some(field => op1.path.includes(field));
  }

  private static applyTransformation(operation: Operation, against: Operation): Operation {
    const transformed = { ...operation };

    switch (operation.type) {
      case 'insert':
        if (against.type === 'insert' && operation.position && against.position) {
          // If inserting after the against operation, adjust position
          if (operation.position >= against.position) {
            transformed.position = operation.position + (against.length || 1);
          }
        }
        break;

      case 'delete':
        if (against.type === 'insert' && operation.position && against.position) {
          // Adjust delete position if text was inserted before it
          if (operation.position > against.position) {
            transformed.position = operation.position + (against.length || 1);
          }
        } else if (against.type === 'delete' && operation.position && against.position) {
          // Adjust delete position if text was deleted before it
          if (operation.position > against.position) {
            transformed.position = operation.position - (against.length || 1);
          }
        }
        break;

      case 'replace':
        // Replace operations are typically handled as delete + insert
        // Complex logic would go here
        break;

      default:
        // For other operations, return as-is
        break;
    }

    return transformed;
  }

  /**
   * Transforms a list of operations against each other in order
   */
  static transformOperations(operations: Operation[]): Operation[] {
    if (operations.length <= 1) return operations;

    const transformed: Operation[] = [];
    
    for (let i = 0; i < operations.length; i++) {
      let currentOp = operations[i];
      
      // Transform against all previous operations
      for (let j = 0; j < i; j++) {
        const result = this.transform(currentOp, transformed[j]);
        currentOp = result.transformedOperation;
      }
      
      transformed.push(currentOp);
    }

    return transformed;
  }
}

// ==============================================================================
// CONFLICT DETECTION SERVICE
// ==============================================================================

export class ConflictDetectionService {
  private static readonly CONFLICT_WINDOW_MS = 10000; // 10 seconds

  /**
   * Detects conflicts between recent operations on the same worksheet
   */
  static async detectConflicts(
    worksheetId: string,
    newOperation: Operation
  ): Promise<ChangeConflict[]> {
    if (!supabase) return [];

    try {
      // Get recent operations on the same path
      const { data: recentChanges, error } = await supabase
        .from('realtime_changes')
        .select('*')
        .eq('worksheet_id', worksheetId)
        .eq('field_path', newOperation.path)
        .gte('timestamp', new Date(Date.now() - this.CONFLICT_WINDOW_MS).toISOString())
        .neq('user_id', newOperation.userId)
        .order('timestamp', { ascending: false });

      if (error || !recentChanges) return [];

      const conflicts: ChangeConflict[] = [];

      for (const change of recentChanges) {
        const conflict = this.analyzeConflict(newOperation, change);
        if (conflict) {
          conflicts.push(conflict);
        }
      }

      // Save detected conflicts to database
      for (const conflict of conflicts) {
        await this.saveConflict(conflict);
      }

      return conflicts;
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return [];
    }
  }

  private static analyzeConflict(
    newOp: Operation,
    existingChange: any
  ): ChangeConflict | null {
    const existingOp: Operation = {
      id: existingChange.operation_id,
      type: existingChange.change_type,
      path: existingChange.field_path,
      position: existingChange.change_position,
      length: existingChange.change_length,
      oldValue: existingChange.old_value,
      newValue: existingChange.new_value,
      timestamp: new Date(existingChange.timestamp),
      userId: existingChange.user_id,
      sessionId: existingChange.session_id,
    };

    // Check for concurrent edits
    if (this.isConcurrentEdit(newOp, existingOp)) {
      return {
        id: nanoid(),
        worksheetId: existingChange.worksheet_id,
        conflictType: 'concurrent_edit',
        fieldPath: newOp.path,
        changeAId: existingChange.id,
        changeBId: newOp.id,
        userAId: existingOp.userId,
        userBId: newOp.userId,
        resolutionStatus: 'unresolved',
        createdAt: new Date(),
      };
    }

    return null;
  }

  private static isConcurrentEdit(op1: Operation, op2: Operation): boolean {
    // Same path, different new values
    if (op1.path === op2.path && op1.newValue !== op2.newValue) {
      // Check if they're close in time
      const timeDiff = Math.abs(op1.timestamp.getTime() - op2.timestamp.getTime());
      return timeDiff <= this.CONFLICT_WINDOW_MS;
    }

    return false;
  }

  private static async saveConflict(conflict: ChangeConflict): Promise<void> {
    if (!supabase) return;

    try {
      await supabase
        .from('change_conflicts')
        .insert({
          id: conflict.id,
          worksheet_id: conflict.worksheetId,
          conflict_type: conflict.conflictType,
          field_path: conflict.fieldPath,
          change_a_id: conflict.changeAId,
          change_b_id: conflict.changeBId,
          user_a_id: conflict.userAId,
          user_b_id: conflict.userBId,
          resolution_status: conflict.resolutionStatus,
        });
    } catch (error) {
      console.error('Error saving conflict:', error);
    }
  }
}

// ==============================================================================
// MERGE STRATEGIES
// ==============================================================================

export class LastWriteWinsStrategy implements MergeStrategy {
  name = 'last_write_wins';
  priority = 1;

  canHandle(conflict: ChangeConflict): boolean {
    // Can handle simple field conflicts
    return conflict.conflictType === 'concurrent_edit' && 
           !this.isCriticalField(conflict.fieldPath);
  }

  async resolve(conflict: ChangeConflict, operations: Operation[]): Promise<any> {
    // Find the most recent operation
    const sortedOps = operations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const winningOp = sortedOps[0];

    return {
      resolvedValue: winningOp.newValue,
      resolutionMethod: 'last_write_wins' as ResolutionMethod,
      winner: winningOp.userId,
    };
  }

  private isCriticalField(fieldPath: string): boolean {
    const criticalFields = [
      'status',
      'priorityLevel',
      'operationalPeriodStart',
      'operationalPeriodEnd',
    ];

    return criticalFields.some(field => fieldPath.includes(field));
  }
}

export class SmartMergeStrategy implements MergeStrategy {
  name = 'smart_merge';
  priority = 2;

  canHandle(conflict: ChangeConflict): boolean {
    return conflict.conflictType === 'concurrent_edit' && 
           this.isMergeableField(conflict.fieldPath);
  }

  async resolve(conflict: ChangeConflict, operations: Operation[]): Promise<any> {
    const fieldPath = conflict.fieldPath;

    // Handle different types of mergeable fields
    if (fieldPath.includes('assignedStaff') || fieldPath.includes('assignedVolunteers')) {
      return this.mergeArrayFields(operations);
    }

    if (fieldPath.includes('notes') || fieldPath.includes('description')) {
      return this.mergeTextFields(operations);
    }

    if (fieldPath.includes('progressPercentage')) {
      return this.mergeNumericFields(operations);
    }

    // Default to last write wins
    const sortedOps = operations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return {
      resolvedValue: sortedOps[0].newValue,
      resolutionMethod: 'smart_merge' as ResolutionMethod,
    };
  }

  private isMergeableField(fieldPath: string): boolean {
    const mergeableFields = [
      'assignedStaff',
      'assignedVolunteers',
      'notes',
      'description',
      'progressPercentage',
      'equipmentRequired',
      'materialsRequired',
    ];

    return mergeableFields.some(field => fieldPath.includes(field));
  }

  private async mergeArrayFields(operations: Operation[]): Promise<any> {
    const allArrays = operations
      .filter(op => Array.isArray(op.newValue))
      .map(op => op.newValue);

    // Combine all arrays and remove duplicates
    const merged = [...new Set(allArrays.flat())];

    return {
      resolvedValue: merged,
      resolutionMethod: 'smart_merge' as ResolutionMethod,
      mergeType: 'array_union',
    };
  }

  private async mergeTextFields(operations: Operation[]): Promise<any> {
    const textOperations = operations
      .filter(op => typeof op.newValue === 'string')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Combine text with user attribution
    const mergedText = textOperations
      .map(op => `[${new Date(op.timestamp).toLocaleString()}] ${op.newValue}`)
      .join('\n\n');

    return {
      resolvedValue: mergedText,
      resolutionMethod: 'smart_merge' as ResolutionMethod,
      mergeType: 'text_append',
    };
  }

  private async mergeNumericFields(operations: Operation[]): Promise<any> {
    const numericOps = operations
      .filter(op => typeof op.newValue === 'number')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // For progress percentage, take the highest value
    const maxValue = Math.max(...numericOps.map(op => op.newValue));

    return {
      resolvedValue: maxValue,
      resolutionMethod: 'smart_merge' as ResolutionMethod,
      mergeType: 'numeric_max',
    };
  }
}

export class ManualResolutionStrategy implements MergeStrategy {
  name = 'manual_resolution';
  priority = 3;

  canHandle(conflict: ChangeConflict): boolean {
    // Always can handle, but lowest priority
    return true;
  }

  async resolve(conflict: ChangeConflict, operations: Operation[]): Promise<any> {
    // Mark for manual resolution
    return {
      requiresManualResolution: true,
      resolutionMethod: 'manual' as ResolutionMethod,
      conflictId: conflict.id,
      operations,
    };
  }
}

// ==============================================================================
// MAIN CONFLICT RESOLUTION SERVICE
// ==============================================================================

export class ConflictResolutionService {
  private strategies: MergeStrategy[];

  constructor() {
    this.strategies = [
      new ManualResolutionStrategy(),
      new SmartMergeStrategy(),
      new LastWriteWinsStrategy(),
    ].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Resolves a conflict using the best available strategy
   */
  async resolveConflict(conflictId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      // Get conflict details
      const { data: conflict, error: conflictError } = await supabase
        .from('change_conflicts')
        .select('*')
        .eq('id', conflictId)
        .single();

      if (conflictError || !conflict) {
        console.error('Conflict not found:', conflictError);
        return false;
      }

      // Get related operations
      const operations = await this.getConflictOperations(conflict);

      // Find the best strategy
      const strategy = this.strategies.find(s => s.canHandle(conflict));
      if (!strategy) {
        console.error('No strategy found for conflict:', conflict);
        return false;
      }

      // Resolve the conflict
      const resolution = await strategy.resolve(conflict, operations);

      if (resolution.requiresManualResolution) {
        // Mark as requiring manual resolution
        await this.markForManualResolution(conflictId, resolution);
        return true; // Successfully marked, not resolved
      }

      // Apply the resolution
      await this.applyResolution(conflict, resolution);

      // Mark conflict as resolved
      await this.markResolved(conflictId, strategy.name as ResolutionMethod, resolution);

      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }

  /**
   * Resolves all pending conflicts for a worksheet
   */
  async resolveWorksheetConflicts(worksheetId: string): Promise<number> {
    if (!supabase) return 0;

    try {
      const { data: conflicts, error } = await supabase
        .from('change_conflicts')
        .select('id')
        .eq('worksheet_id', worksheetId)
        .eq('resolution_status', 'unresolved');

      if (error || !conflicts) return 0;

      let resolvedCount = 0;

      for (const conflict of conflicts) {
        const resolved = await this.resolveConflict(conflict.id);
        if (resolved) resolvedCount++;
      }

      return resolvedCount;
    } catch (error) {
      console.error('Error resolving worksheet conflicts:', error);
      return 0;
    }
  }

  /**
   * Manually resolve a conflict with a specific resolution
   */
  async manuallyResolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
    resolvedValue: any,
    resolvedBy: string
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      // Get conflict details
      const { data: conflict, error: conflictError } = await supabase
        .from('change_conflicts')
        .select('*')
        .eq('id', conflictId)
        .single();

      if (conflictError || !conflict) return false;

      // Apply the manual resolution
      await this.applyManualResolution(conflict, resolvedValue);

      // Update conflict record
      await supabase
        .from('change_conflicts')
        .update({
          resolution_status: 'manual_resolved',
          resolution_method: 'manual',
          conflict_resolution: resolution,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          resolution_notes: `Manually resolved using ${resolution} strategy`,
        })
        .eq('id', conflictId);

      return true;
    } catch (error) {
      console.error('Error manually resolving conflict:', error);
      return false;
    }
  }

  /**
   * Gets all unresolved conflicts for a worksheet
   */
  async getWorksheetConflicts(worksheetId: string): Promise<ChangeConflict[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('change_conflicts')
        .select('*')
        .eq('worksheet_id', worksheetId)
        .in('resolution_status', ['unresolved', 'escalated'])
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(record => ({
        id: record.id,
        worksheetId: record.worksheet_id,
        conflictType: record.conflict_type,
        fieldPath: record.field_path,
        changeAId: record.change_a_id,
        changeBId: record.change_b_id,
        userAId: record.user_a_id,
        userBId: record.user_b_id,
        resolutionStatus: record.resolution_status,
        resolutionMethod: record.resolution_method,
        resolvedBy: record.resolved_by,
        resolvedAt: record.resolved_at ? new Date(record.resolved_at) : undefined,
        resolutionNotes: record.resolution_notes,
        createdAt: new Date(record.created_at),
      }));
    } catch (error) {
      console.error('Error getting worksheet conflicts:', error);
      return [];
    }
  }

  // ==============================================================================
  // PRIVATE HELPER METHODS
  // ==============================================================================

  private async getConflictOperations(conflict: any): Promise<Operation[]> {
    if (!supabase) return [];

    const changeIds = [conflict.change_a_id, conflict.change_b_id].filter(Boolean);
    if (changeIds.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('realtime_changes')
        .select('*')
        .in('id', changeIds);

      if (error || !data) return [];

      return data.map(change => ({
        id: change.operation_id,
        type: change.change_type,
        path: change.field_path,
        position: change.change_position,
        length: change.change_length,
        oldValue: change.old_value,
        newValue: change.new_value,
        timestamp: new Date(change.timestamp),
        userId: change.user_id,
        sessionId: change.session_id,
      }));
    } catch (error) {
      console.error('Error getting conflict operations:', error);
      return [];
    }
  }

  private async applyResolution(conflict: any, resolution: any): Promise<void> {
    if (!supabase) return;

    // Apply the resolved value to the worksheet
    const tableName = this.getTableNameFromPath(conflict.field_path);
    const fieldName = this.getFieldNameFromPath(conflict.field_path);
    
    if (tableName && fieldName) {
      await supabase
        .from(tableName)
        .update({ [fieldName]: resolution.resolvedValue })
        .eq('id', conflict.worksheet_id);
    }
  }

  private async applyManualResolution(conflict: any, resolvedValue: any): Promise<void> {
    if (!supabase) return;

    // Apply the manually resolved value
    const tableName = this.getTableNameFromPath(conflict.field_path);
    const fieldName = this.getFieldNameFromPath(conflict.field_path);
    
    if (tableName && fieldName) {
      await supabase
        .from(tableName)
        .update({ [fieldName]: resolvedValue })
        .eq('id', conflict.worksheet_id);
    }
  }

  private async markResolved(
    conflictId: string,
    method: ResolutionMethod,
    resolution: any
  ): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('change_conflicts')
      .update({
        resolution_status: 'auto_resolved',
        resolution_method: method,
        resolved_at: new Date().toISOString(),
        resolution_notes: JSON.stringify(resolution),
      })
      .eq('id', conflictId);
  }

  private async markForManualResolution(
    conflictId: string,
    resolution: any
  ): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('change_conflicts')
      .update({
        resolution_status: 'escalated',
        resolution_notes: JSON.stringify(resolution),
      })
      .eq('id', conflictId);
  }

  private getTableNameFromPath(fieldPath: string): string {
    // Extract table name from field path
    // e.g., "worksheets.missionStatement" -> "ics_215_worksheets"
    if (fieldPath.startsWith('worksheets.')) {
      return 'ics_215_worksheets';
    }
    if (fieldPath.startsWith('assignments.')) {
      return 'work_assignments';
    }
    if (fieldPath.startsWith('resources.')) {
      return 'resource_requirements';
    }
    return '';
  }

  private getFieldNameFromPath(fieldPath: string): string {
    // Extract field name from path
    // e.g., "worksheets.missionStatement" -> "mission_statement"
    const parts = fieldPath.split('.');
    const camelCaseField = parts[parts.length - 1];
    
    // Convert camelCase to snake_case
    return camelCaseField.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * Registers a custom merge strategy
   */
  registerStrategy(strategy: MergeStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Cleanup method
   */
  cleanup(): void {
    // Any cleanup needed
  }
}

// Export singleton instance
export const conflictResolutionService = new ConflictResolutionService();

// Export for testing
export {
  OperationalTransformation,
  ConflictDetectionService,
  LastWriteWinsStrategy,
  SmartMergeStrategy,
  ManualResolutionStrategy,
};