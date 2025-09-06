# Database Migration Plan: From Nested Arrays to Normalized Relations

## Overview

This migration plan transitions the Red Cross Disaster Operations system from:
- **Current**: Complex nested TypeScript objects with arrays for each facility type
- **Target**: Properly normalized relational database with single tables and foreign key relationships

## Migration Strategy

### Phase 1: Database Schema Migration (Zero Downtime)

#### Step 1.1: Create New Tables (Side-by-Side)
```sql
-- Execute the enhanced schema from 21_enhanced_domain.sql
-- This creates new tables alongside existing ones
\i supabase/schema/21_enhanced_domain.sql
```

#### Step 1.2: Data Migration Scripts

**1.2.1 Migrate Operations Data**
```sql
-- Operations table already mostly correct, just add new fields
ALTER TABLE ops.operations ADD COLUMN IF NOT EXISTS estimated_duration_days integer;
ALTER TABLE ops.operations ADD COLUMN IF NOT EXISTS estimated_population_affected integer;
ALTER TABLE ops.operations ADD COLUMN IF NOT EXISTS notes text;
```

**1.2.2 Migrate Facilities Data (CRITICAL)**
```sql
-- Create migration function to consolidate facility arrays
CREATE OR REPLACE FUNCTION migrate_facilities_from_arrays()
RETURNS void AS $$
BEGIN
  -- This would migrate from your current IAP facility structure
  -- Example assumes you have JSON structures in existing tables
  
  -- Insert shelters
  INSERT INTO ops.facilities (
    operation_id, name, facility_type, address, city, county,
    primary_contact_name, primary_contact_phone, total_capacity, 
    current_occupancy, status, service_lines, created_at
  )
  SELECT 
    operation_id,
    facility_data->>'name',
    'shelter',
    facility_data->>'address',
    facility_data->>'city', 
    facility_data->>'county',
    facility_data->'contact'->>'name',
    facility_data->'contact'->>'phone',
    (facility_data->>'capacity')::integer,
    (facility_data->>'occupancy')::integer,
    COALESCE(facility_data->>'status', 'operational'),
    ARRAY['sheltering'],
    now()
  FROM (
    -- Extract from your current IAP document structure
    SELECT operation_id, jsonb_array_elements(iap_data->'facilities'->'shelters') as facility_data
    FROM your_current_iap_table -- Replace with actual table name
    WHERE iap_data->'facilities'->'shelters' IS NOT NULL
  ) shelter_data;
  
  -- Insert feeding facilities
  INSERT INTO ops.facilities (
    operation_id, name, facility_type, address, city, county,
    primary_contact_name, primary_contact_phone, service_lines, created_at
  )
  SELECT 
    operation_id,
    facility_data->>'name',
    'feeding',
    facility_data->>'address',
    facility_data->>'city',
    facility_data->>'county', 
    facility_data->'contact'->>'name',
    facility_data->'contact'->>'phone',
    ARRAY['feeding'],
    now()
  FROM (
    SELECT operation_id, jsonb_array_elements(iap_data->'facilities'->'feeding') as facility_data
    FROM your_current_iap_table
    WHERE iap_data->'facilities'->'feeding' IS NOT NULL
  ) feeding_data;
  
  -- Continue for other facility types (distribution, mobile_units, etc.)
  
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_facilities_from_arrays();
```

**1.2.3 Migrate Personnel Data**
```sql
-- Migrate from current roster structure to normalized personnel
CREATE OR REPLACE FUNCTION migrate_personnel_assignments()
RETURNS void AS $$
BEGIN
  -- First ensure positions table is populated
  INSERT INTO ops.positions (code, title, section, level, is_leadership) VALUES
  ('IC', 'Incident Commander', 'command', 1, true),
  ('DC', 'Deputy Commander', 'command', 2, true),
  ('OPS', 'Operations Section Chief', 'operations', 2, true),
  ('PLAN', 'Planning Section Chief', 'planning', 2, true),
  ('LOG', 'Logistics Section Chief', 'logistics', 2, true),
  ('FIN', 'Finance/Admin Section Chief', 'finance', 2, true),
  -- Add more positions as needed
  ON CONFLICT (code) DO NOTHING;
  
  -- Migrate personnel assignments from current structure
  INSERT INTO ops.personnel_assignments (
    operation_id, person_id, position_code, section, 
    start_date, contact_phone, contact_email, status
  )
  SELECT 
    r.operation_id,
    r.person_id,
    COALESCE(position_code_map.new_code, 'STAFF'), -- map old codes to new
    section_map.new_section,
    r.start_date,
    p.phone,
    p.email,
    CASE WHEN r.end_date IS NULL THEN 'active' ELSE 'released' END
  FROM ops.roster_assignments r  -- current table
  JOIN ops.persons p ON r.person_id = p.id
  LEFT JOIN (
    -- Map old position codes to new standardized codes
    VALUES 
    ('incident_commander', 'IC'),
    ('operations_chief', 'OPS'),
    ('planning_chief', 'PLAN')
    -- Add more mappings
  ) AS position_code_map(old_code, new_code) ON r.position_code = position_code_map.old_code
  LEFT JOIN (
    -- Map old sections to new standardized sections  
    VALUES
    ('command_staff', 'command'),
    ('ops', 'operations')
    -- Add more mappings
  ) AS section_map(old_section, new_section) ON r.section = section_map.old_section;
  
END;
$$ LANGUAGE plpgsql;

SELECT migrate_personnel_assignments();
```

**1.2.4 Migrate Resources/Assets Data**
```sql
CREATE OR REPLACE FUNCTION migrate_resources_from_assets()
RETURNS void AS $$
BEGIN
  -- Migrate from current assets table structure
  INSERT INTO ops.resources (
    operation_id, resource_type, sub_type, identifier,
    description, status, current_location, specifications
  )
  SELECT 
    a.operation_id,
    CASE 
      WHEN a.asset_type ILIKE '%vehicle%' THEN 'vehicle'
      WHEN a.asset_type ILIKE '%equipment%' THEN 'equipment'
      WHEN a.asset_type ILIKE '%supply%' THEN 'supplies'
      ELSE 'other'
    END,
    a.asset_type, -- use original type as sub_type
    a.identifier,
    COALESCE(a.metadata->>'description', a.asset_type),
    a.status,
    a.location,
    a.metadata
  FROM ops.assets a; -- current table
  
END;
$$ LANGUAGE plpgsql;

SELECT migrate_resources_from_assets();
```

#### Step 1.3: Create Reference Data
```sql
-- Insert standard positions
INSERT INTO ops.positions (code, title, section, level, responsibilities, is_leadership) VALUES
('IC', 'Incident Commander', 'command', 1, ARRAY['Overall incident management', 'Strategic decisions', 'External relations'], true),
('DC', 'Deputy Commander', 'command', 2, ARRAY['Assist IC', 'Span of control management'], true),
('SO', 'Safety Officer', 'command', 2, ARRAY['Safety monitoring', 'Risk assessment'], false),
('PIO', 'Public Information Officer', 'command', 2, ARRAY['Media relations', 'Public communications'], false),
('LO', 'Liaison Officer', 'command', 2, ARRAY['External agency coordination'], false),
('OPS', 'Operations Section Chief', 'operations', 2, ARRAY['Direct tactical operations', 'Resource assignments'], true),
('PLAN', 'Planning Section Chief', 'planning', 2, ARRAY['IAP development', 'Resource tracking', 'Documentation'], true),
('LOG', 'Logistics Section Chief', 'logistics', 2, ARRAY['Support operations', 'Resource procurement'], true),
('FIN', 'Finance/Admin Section Chief', 'finance', 2, ARRAY['Cost tracking', 'Administrative support'], true)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  level = EXCLUDED.level,
  responsibilities = EXCLUDED.responsibilities,
  is_leadership = EXCLUDED.is_leadership;
```

### Phase 2: Application Layer Migration

#### Step 2.1: Update Data Access Layer
Create new database service classes that use normalized queries instead of complex object manipulation:

```typescript
// services/FacilityService.ts
export class FacilityService {
  async getFacilitiesByOperation(operationId: string, query?: FacilityQuery): Promise<FacilitySummaryView[]> {
    // Use the facility_summary view instead of reconstructing from arrays
    return this.supabase
      .from('facility_summary')
      .select('*')
      .eq('operation_id', operationId)
      .apply(query); // apply filters
  }
  
  async createFacility(facility: CreateFacilityRequest): Promise<Facility> {
    // Single insert instead of array manipulation
    const { data } = await this.supabase
      .from('facilities')
      .insert(facility)
      .select()
      .single();
    return data;
  }
}

// services/PersonnelService.ts  
export class PersonnelService {
  async getActivePersonnel(operationId: string): Promise<ActivePersonnelView[]> {
    // Use view instead of complex joins in app
    return this.supabase
      .from('active_personnel')
      .select('*')
      .eq('operation_id', operationId);
  }
}
```

#### Step 2.2: Update React Components
Replace complex state management with normalized data fetching:

```typescript
// Before: Complex nested state
const [iapFacilities, setIapFacilities] = useState({
  shelters: [],
  feeding: [],
  distribution: [],
  // ... separate arrays for each type
});

// After: Single normalized query
const { data: facilities } = useFacilities(operationId, { 
  facility_type: ['shelter', 'feeding', 'distribution'] 
});

// Group by type in UI layer if needed
const facilitiesByType = groupBy(facilities, 'facility_type');
```

### Phase 3: Validation & Testing

#### Step 3.1: Data Integrity Verification
```sql
-- Verify migration completeness
CREATE OR REPLACE FUNCTION verify_migration() 
RETURNS TABLE(check_name text, status text, count_before bigint, count_after bigint)
AS $$
BEGIN
  -- Check facility migration
  RETURN QUERY 
  SELECT 
    'Facilities Migration'::text,
    CASE WHEN old_count = new_count THEN 'PASS' ELSE 'FAIL' END,
    old_count,
    new_count
  FROM (
    SELECT 
      (SELECT COUNT(*) FROM old_facility_arrays) as old_count, -- your calculation
      (SELECT COUNT(*) FROM ops.facilities) as new_count
  ) counts;
  
  -- Check personnel migration  
  RETURN QUERY
  SELECT 
    'Personnel Migration'::text,
    CASE WHEN old_count <= new_count THEN 'PASS' ELSE 'FAIL' END, -- <= because we might have more normalized records
    old_count,
    new_count
  FROM (
    SELECT
      (SELECT COUNT(*) FROM ops.roster_assignments) as old_count,
      (SELECT COUNT(*) FROM ops.personnel_assignments) as new_count
  ) counts;
  
END;
$$ LANGUAGE plpgsql;

SELECT * FROM verify_migration();
```

#### Step 3.2: Performance Testing
```sql
-- Test query performance with indexes
EXPLAIN ANALYZE 
SELECT * FROM ops.facility_summary 
WHERE operation_id = 'test-operation-id';

EXPLAIN ANALYZE
SELECT * FROM ops.active_personnel 
WHERE operation_id = 'test-operation-id' 
AND section = 'operations';
```

### Phase 4: Cleanup & Optimization

#### Step 4.1: Remove Old Structures (After validation)
```sql
-- Only after confirming migration success
-- DROP TABLE old_iap_document_table;
-- DROP TABLE old_facility_arrays_table;

-- Clean up migration functions
DROP FUNCTION IF EXISTS migrate_facilities_from_arrays();
DROP FUNCTION IF EXISTS migrate_personnel_assignments(); 
DROP FUNCTION IF EXISTS migrate_resources_from_assets();
```

#### Step 4.2: Add Additional Indexes for Production
```sql
-- Performance indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_facilities_operation_type_status 
ON ops.facilities(operation_id, facility_type, status);

CREATE INDEX CONCURRENTLY idx_personnel_assignments_facility_section 
ON ops.personnel_assignments(facility_id, section) WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_gaps_open_by_severity 
ON ops.gaps(operation_id, severity, priority) WHERE status = 'open';
```

## Migration Checklist

### Pre-Migration
- [ ] Backup production database
- [ ] Run migration on staging environment
- [ ] Validate all data transformations
- [ ] Test application functionality with new schema
- [ ] Performance test critical queries
- [ ] Train team on new data model

### Migration Day
- [ ] Put application in maintenance mode
- [ ] Execute schema creation (5 minutes)
- [ ] Run data migration scripts (15-30 minutes)
- [ ] Validate data integrity (10 minutes)
- [ ] Deploy updated application code (10 minutes)
- [ ] Run smoke tests (10 minutes)
- [ ] Remove maintenance mode

### Post-Migration
- [ ] Monitor query performance
- [ ] Validate reports and IAP generation
- [ ] Collect user feedback
- [ ] Schedule old table cleanup (after 1 week)
- [ ] Update documentation and training materials

## Rollback Plan

If migration fails:
1. Restore from backup (fastest option)
2. Or keep old tables during migration and switch application back
3. Debug issues in staging environment
4. Re-plan migration execution

## Risk Mitigation

1. **Data Loss Prevention**: Multiple validation steps and backup strategy
2. **Performance Issues**: Comprehensive indexing and query optimization
3. **Application Bugs**: Gradual migration with feature flags
4. **User Training**: Documentation and training before rollout

## Timeline Estimate

- **Planning & Staging**: 2-3 days
- **Migration Execution**: 2-4 hours
- **Validation & Cleanup**: 1-2 days
- **Total Project**: 1 week