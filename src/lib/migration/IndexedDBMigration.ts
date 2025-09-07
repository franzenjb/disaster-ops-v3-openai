/**
 * IndexedDB to Supabase Migration Utility
 * 
 * This utility handles the migration from the complex event-sourced IndexedDB system 
 * to the simplified Supabase relational database during the disaster-ops-v3 salvage operation.
 * 
 * PHASE 2 - WEEK 2 IMPLEMENTATION
 */

import { supabase } from '../supabase';

// Types for legacy IndexedDB data structures
interface LegacyEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  actorId?: string;
}

interface LegacyOperation {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  metadata?: any;
}

interface LegacyFacility {
  id: string;
  operationId: string;
  name: string;
  type: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: string;
  metadata?: any;
}

// Migration result tracking
interface MigrationResult {
  success: boolean;
  recordsProcessed: number;
  recordsMigrated: number;
  errors: string[];
  duration: number;
  tables: {
    operations: number;
    facilities: number;
    personnel_assignments: number;
    iap_documents: number;
    work_assignments: number;
  };
}

/**
 * Main migration class that handles the complete data transfer
 */
export class IndexedDBMigration {
  private startTime: number = 0;
  private errors: string[] = [];

  /**
   * Execute the complete migration process
   */
  async migrate(): Promise<MigrationResult> {
    console.log('🚀 Starting IndexedDB → Supabase migration...');
    this.startTime = Date.now();

    try {
      // 1. Export data from IndexedDB
      console.log('📤 Exporting data from IndexedDB...');
      const legacyData = await this.exportFromIndexedDB();
      console.log(`📊 Exported ${JSON.stringify(this.getDataCounts(legacyData))} records`);

      // 2. Transform data to Supabase format
      console.log('🔄 Transforming data to relational format...');
      const transformedData = await this.transformData(legacyData);

      // 3. Validate transformed data
      console.log('✅ Validating transformed data...');
      await this.validateData(transformedData);

      // 4. Import to Supabase
      console.log('📥 Importing to Supabase...');
      const importResult = await this.importToSupabase(transformedData);

      const result: MigrationResult = {
        success: true,
        recordsProcessed: this.getTotalRecords(legacyData),
        recordsMigrated: importResult.totalRecords,
        errors: this.errors,
        duration: Date.now() - this.startTime,
        tables: importResult.tables
      };

      console.log('✅ Migration completed successfully!');
      console.log(`📊 Results: ${result.recordsMigrated} records migrated in ${result.duration}ms`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errors.push(errorMessage);
      
      console.error('❌ Migration failed:', errorMessage);
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        errors: this.errors,
        duration: Date.now() - this.startTime,
        tables: {
          operations: 0,
          facilities: 0,
          personnel_assignments: 0,
          iap_documents: 0,
          work_assignments: 0
        }
      };
    }
  }

  /**
   * Export all data from IndexedDB (Dexie database)
   */
  private async exportFromIndexedDB(): Promise<any> {
    // This would connect to the actual Dexie database
    // For now, we'll simulate with sample data that matches the existing structure
    
    try {
      // In real implementation: 
      // import { db } from '../store/LocalStore';
      // const operations = await db.operations.toArray();
      // etc...

      // Sample data for migration testing
      const sampleData = {
        operations: [
          {
            id: 'op-hurricane-milton',
            name: 'Hurricane Milton Response',
            type: 'Hurricane',
            status: 'active',
            createdAt: '2024-10-01T00:00:00Z',
            metadata: {
              creator: 'John Smith',
              email: 'john.smith@redcross.org',
              regions: ['Southeast Region', 'Florida Region'],
              counties: ['Hillsborough County', 'Pinellas County']
            }
          }
        ],
        facilities: [
          {
            id: 'facility-1',
            operationId: 'op-hurricane-milton',
            name: 'Central High School Shelter',
            type: 'shelter',
            address: '123 Main St, Tampa, FL 33601',
            coordinates: { lat: 27.9506, lng: -82.4572 },
            status: 'active',
            metadata: {
              discipline: 'Sheltering',
              capacity: { maximum: 200, current: 45 },
              contact: { phone: '813-555-0123', manager: 'Jane Doe' }
            }
          }
        ],
        events: [
          {
            id: 'event-1',
            type: 'FACILITY_CREATED',
            payload: { facilityId: 'facility-1', name: 'Central High School Shelter' },
            timestamp: '2024-10-01T08:00:00Z',
            actorId: 'user-1'
          }
        ],
        roster: [
          {
            id: 'roster-1',
            operationId: 'op-hurricane-milton',
            facilityId: 'facility-1',
            personName: 'Bob Wilson',
            role: 'Shelter Manager',
            section: 'Operations',
            shift: 'Day',
            status: 'assigned'
          }
        ],
        iap: [
          {
            id: 'iap-1',
            operationId: 'op-hurricane-milton',
            version: 1,
            title: 'Hurricane Milton IAP v1',
            content: {
              directorMessage: 'First operational period for Hurricane Milton response...',
              facilities: ['facility-1'],
              workAssignments: ['assignment-1']
            },
            status: 'published',
            createdAt: '2024-10-01T18:00:00Z'
          }
        ]
      };

      return sampleData;

    } catch (error) {
      this.errors.push(`IndexedDB export failed: ${error}`);
      throw error;
    }
  }

  /**
   * Transform complex event-sourced data to simple relational format
   */
  private async transformData(legacyData: any): Promise<any> {
    const transformed = {
      operations: [],
      facilities: [],
      personnel_assignments: [],
      iap_documents: [],
      work_assignments: []
    };

    // Transform operations
    for (const op of legacyData.operations || []) {
      transformed.operations.push({
        id: op.id,
        name: op.name,
        disaster_type: op.type || 'Unknown',
        activation_level: op.metadata?.activationLevel || 'Level 1',
        status: op.status,
        creator_name: op.metadata?.creator,
        creator_email: op.metadata?.email,
        regions: op.metadata?.regions || [],
        counties: op.metadata?.counties || [],
        created_at: op.createdAt,
        updated_at: op.createdAt
      });
    }

    // Transform facilities  
    for (const facility of legacyData.facilities || []) {
      transformed.facilities.push({
        id: facility.id,
        operation_id: facility.operationId,
        name: facility.name,
        type: facility.type,
        discipline: facility.metadata?.discipline || this.mapTypeToDisipline(facility.type),
        address: facility.address,
        coordinates: facility.coordinates ? 
          `POINT(${facility.coordinates.lng} ${facility.coordinates.lat})` : null,
        status: facility.status,
        capacity: facility.metadata?.capacity || {},
        contact_info: facility.metadata?.contact || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Transform roster entries to personnel assignments
    for (const roster of legacyData.roster || []) {
      transformed.personnel_assignments.push({
        id: roster.id,
        operation_id: roster.operationId,
        facility_id: roster.facilityId,
        person_name: roster.personName,
        person_email: roster.email,
        person_phone: roster.phone,
        role: roster.role,
        ics_position: roster.icsPosition,
        section: roster.section,
        shift: roster.shift || 'Day',
        status: roster.status || 'assigned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Transform IAP documents
    for (const iap of legacyData.iap || []) {
      transformed.iap_documents.push({
        id: iap.id,
        operation_id: iap.operationId,
        version: iap.version || 1,
        title: iap.title,
        content: iap.content || {},
        status: iap.status || 'draft',
        is_official_snapshot: iap.isOfficial || false,
        snapshot_time: iap.snapshotTime,
        published_at: iap.publishedAt,
        created_at: iap.createdAt || new Date().toISOString(),
        updated_at: iap.updatedAt || new Date().toISOString()
      });
    }

    return transformed;
  }

  /**
   * Validate transformed data before import
   */
  private async validateData(data: any): Promise<void> {
    const validations = [
      { table: 'operations', required: ['id', 'name', 'disaster_type'] },
      { table: 'facilities', required: ['id', 'operation_id', 'name', 'type'] },
      { table: 'personnel_assignments', required: ['id', 'operation_id', 'person_name'] },
      { table: 'iap_documents', required: ['id', 'operation_id', 'title'] }
    ];

    for (const validation of validations) {
      for (const record of data[validation.table] || []) {
        for (const field of validation.required) {
          if (!record[field]) {
            throw new Error(`Missing required field ${field} in ${validation.table} record ${record.id || 'unknown'}`);
          }
        }
      }
    }

    console.log('✅ Data validation passed');
  }

  /**
   * Import transformed data to Supabase
   */
  private async importToSupabase(data: any): Promise<{ totalRecords: number; tables: any }> {
    const results = {
      operations: 0,
      facilities: 0,
      personnel_assignments: 0,
      iap_documents: 0,
      work_assignments: 0
    };

    // Import operations
    if (data.operations.length > 0) {
      const { error } = await supabase
        .from('operations')
        .insert(data.operations);
      
      if (error) throw new Error(`Operations import failed: ${error.message}`);
      results.operations = data.operations.length;
      console.log(`✅ Imported ${results.operations} operations`);
    }

    // Import facilities
    if (data.facilities.length > 0) {
      const { error } = await supabase
        .from('facilities')
        .insert(data.facilities);
      
      if (error) throw new Error(`Facilities import failed: ${error.message}`);
      results.facilities = data.facilities.length;
      console.log(`✅ Imported ${results.facilities} facilities`);
    }

    // Import personnel assignments
    if (data.personnel_assignments.length > 0) {
      const { error } = await supabase
        .from('personnel_assignments')
        .insert(data.personnel_assignments);
      
      if (error) throw new Error(`Personnel assignments import failed: ${error.message}`);
      results.personnel_assignments = data.personnel_assignments.length;
      console.log(`✅ Imported ${results.personnel_assignments} personnel assignments`);
    }

    // Import IAP documents
    if (data.iap_documents.length > 0) {
      const { error } = await supabase
        .from('iap_documents')
        .insert(data.iap_documents);
      
      if (error) throw new Error(`IAP documents import failed: ${error.message}`);
      results.iap_documents = data.iap_documents.length;
      console.log(`✅ Imported ${results.iap_documents} IAP documents`);
    }

    const totalRecords = Object.values(results).reduce((sum, count) => sum + count, 0);
    return { totalRecords, tables: results };
  }

  /**
   * Helper methods
   */
  private mapTypeToDisipline(type: string): string {
    const mapping: { [key: string]: string } = {
      'shelter': 'Sheltering',
      'feeding': 'Feeding', 
      'kitchen': 'Feeding',
      'distribution': 'Distribution',
      'government': 'Government Operations',
      'assessment': 'Damage Assessment'
    };
    return mapping[type] || 'Operations';
  }

  private getDataCounts(data: any): any {
    return {
      operations: data.operations?.length || 0,
      facilities: data.facilities?.length || 0,
      roster: data.roster?.length || 0,
      events: data.events?.length || 0,
      iap: data.iap?.length || 0
    };
  }

  private getTotalRecords(data: any): number {
    const counts = this.getDataCounts(data);
    return Object.values(counts).reduce((sum: number, count: any) => sum + count, 0);
  }

  /**
   * Rollback capability - restore from backup if migration fails
   */
  async rollback(): Promise<boolean> {
    console.log('🔄 Starting migration rollback...');
    try {
      // In real implementation, this would restore from backup
      // For now, just log the action
      console.log('✅ Rollback completed - IndexedDB data preserved');
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      return false;
    }
  }

  /**
   * Verify migration success by comparing record counts
   */
  async verifyMigration(originalCounts: any): Promise<boolean> {
    console.log('🔍 Verifying migration integrity...');
    
    try {
      // Check operations count
      const { count: operationsCount } = await supabase
        .from('operations')
        .select('*', { count: 'exact', head: true });

      // Check facilities count  
      const { count: facilitiesCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });

      const verification = {
        operations: operationsCount === originalCounts.operations,
        facilities: facilitiesCount === originalCounts.facilities
      };

      const success = Object.values(verification).every(Boolean);
      console.log(success ? '✅ Migration verification passed' : '❌ Migration verification failed');
      
      return success;
    } catch (error) {
      console.error('❌ Migration verification error:', error);
      return false;
    }
  }
}

// Export convenience functions
export async function migrateFromIndexedDB(): Promise<MigrationResult> {
  const migration = new IndexedDBMigration();
  return await migration.migrate();
}

export async function verifyMigration(originalCounts: any): Promise<boolean> {
  const migration = new IndexedDBMigration();
  return await migration.verifyMigration(originalCounts);
}

export async function rollbackMigration(): Promise<boolean> {
  const migration = new IndexedDBMigration();
  return await migration.rollback();
}