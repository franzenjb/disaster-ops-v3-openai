/**
 * CRITICAL: Change Detection & Conflict Resolution
 * 
 * Detects changes between data versions and resolves conflicts
 * when multiple users edit the same data simultaneously.
 */

export interface DataChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  userId: string;
}

export interface ChangeSet {
  recordId: string;
  tableName: string;
  changes: DataChange[];
  version: number;
  timestamp: Date;
  userId: string;
}

export interface ConflictResolution {
  field: string;
  strategy: 'last-write-wins' | 'merge' | 'user-choice' | 'reject';
  resolvedValue: any;
  reason: string;
}

/**
 * Intelligent change detection and conflict resolution
 */
export class ChangeDetector {
  /**
   * Detect changes between two data objects
   */
  detectChanges(oldData: any, newData: any, userId: string): DataChange[] {
    const changes: DataChange[] = [];
    
    if (!oldData || !newData) {
      return changes;
    }
    
    // Compare all fields in newData
    for (const [field, newValue] of Object.entries(newData)) {
      const oldValue = oldData[field];
      
      // Skip system fields that shouldn't trigger change detection
      if (field === 'updated_at' || field === 'created_at') {
        continue;
      }
      
      // Deep comparison for complex objects
      if (!this.isEqual(oldValue, newValue)) {
        changes.push({
          field,
          oldValue,
          newValue,
          timestamp: new Date(),
          userId
        });
      }
    }
    
    return changes;
  }
  
  /**
   * Resolve conflicts when multiple changes affect the same data
   */
  resolveConflicts(
    localChanges: ChangeSet,
    remoteChanges: ChangeSet[]
  ): ConflictResolution[] {
    const resolutions: ConflictResolution[] = [];
    
    // Group remote changes by field
    const remoteByField = new Map<string, DataChange[]>();
    remoteChanges.forEach(changeSet => {
      changeSet.changes.forEach(change => {
        if (!remoteByField.has(change.field)) {
          remoteByField.set(change.field, []);
        }
        remoteByField.get(change.field)!.push(change);
      });
    });
    
    // Check each local change for conflicts
    localChanges.changes.forEach(localChange => {
      const remoteChangesForField = remoteByField.get(localChange.field) || [];
      
      if (remoteChangesForField.length === 0) {
        // No conflict - local change wins
        resolutions.push({
          field: localChange.field,
          strategy: 'last-write-wins',
          resolvedValue: localChange.newValue,
          reason: 'No conflicting remote changes'
        });
      } else {
        // Conflict detected - apply resolution strategy
        const resolution = this.resolveFieldConflict(localChange, remoteChangesForField);
        resolutions.push(resolution);
      }
    });
    
    return resolutions;
  }
  
  /**
   * Merge changes from multiple sources intelligently
   */
  mergeChanges(baseData: any, changeSets: ChangeSet[]): any {
    let mergedData = { ...baseData };
    
    // Sort changes by timestamp (earliest first)
    const allChanges = changeSets
      .flatMap(cs => cs.changes.map(c => ({ ...c, version: cs.version })))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Apply changes in chronological order
    allChanges.forEach(change => {
      mergedData = this.applyChange(mergedData, change);
    });
    
    return mergedData;
  }
  
  /**
   * Create a change summary for logging/auditing
   */
  summarizeChanges(changes: DataChange[]): string {
    if (changes.length === 0) {
      return 'No changes';
    }
    
    const fieldNames = changes.map(c => c.field);
    const uniqueFields = [...new Set(fieldNames)];
    
    if (uniqueFields.length === 1) {
      return `Changed ${uniqueFields[0]}`;
    } else if (uniqueFields.length <= 3) {
      return `Changed ${uniqueFields.join(', ')}`;
    } else {
      return `Changed ${uniqueFields.length} fields`;
    }
  }
  
  /**
   * Validate that a change is safe to apply
   */
  validateChange(change: DataChange, currentData: any): boolean {
    // Basic validation - check if the old value matches current
    if (currentData[change.field] !== change.oldValue) {
      console.warn(`Change validation failed: ${change.field} has been modified by another user`);
      return false;
    }
    
    // Field-specific validation
    switch (change.field) {
      case 'time':
        return this.validateTimeField(change.newValue);
      case 'event_name':
        return this.validateEventName(change.newValue);
      case 'priority':
        return this.validatePriority(change.newValue);
      default:
        return true;
    }
  }
  
  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================
  
  private isEqual(value1: any, value2: any): boolean {
    // Handle null/undefined
    if (value1 === value2) return true;
    if (value1 == null || value2 == null) return false;
    
    // Handle primitives
    if (typeof value1 !== 'object' || typeof value2 !== 'object') {
      return value1 === value2;
    }
    
    // Handle arrays
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return false;
      return value1.every((item, index) => this.isEqual(item, value2[index]));
    }
    
    // Handle objects
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
      keys2.includes(key) && this.isEqual(value1[key], value2[key])
    );
  }
  
  private resolveFieldConflict(
    localChange: DataChange,
    remoteChanges: DataChange[]
  ): ConflictResolution {
    // Find the most recent remote change
    const latestRemote = remoteChanges
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    // Strategy: Last write wins (most recent timestamp)
    const localIsNewer = localChange.timestamp.getTime() > latestRemote.timestamp.getTime();
    
    if (localIsNewer) {
      return {
        field: localChange.field,
        strategy: 'last-write-wins',
        resolvedValue: localChange.newValue,
        reason: `Local change is newer (${localChange.timestamp.toISOString()})`
      };
    } else {
      return {
        field: localChange.field,
        strategy: 'last-write-wins',
        resolvedValue: latestRemote.newValue,
        reason: `Remote change is newer (${latestRemote.timestamp.toISOString()})`
      };
    }
  }
  
  private applyChange(data: any, change: DataChange): any {
    return {
      ...data,
      [change.field]: change.newValue,
      updated_at: change.timestamp
    };
  }
  
  private validateTimeField(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value);
  }
  
  private validateEventName(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    return value.length > 0 && value.length <= 200;
  }
  
  private validatePriority(value: any): boolean {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    return validPriorities.includes(value);
  }
}

// Export singleton instance
export const changeDetector = new ChangeDetector();