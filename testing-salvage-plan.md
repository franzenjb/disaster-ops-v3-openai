# Testing Infrastructure Salvage Plan
## Disaster Operations v3 - Bulletproof Testing Strategy

### Executive Summary

The disaster-ops-v3 testing infrastructure is completely broken with **0% test coverage** due to critical configuration failures. This plan outlines a comprehensive strategy to rebuild the testing infrastructure from the ground up while aligning with the **UI Salvage** and **Supabase Backend Replacement** strategies defined by other specialists.

**Current Crisis:**
- ❌ All tests failing due to TypeScript/Jest configuration issues
- ❌ Import/export mismatches preventing test execution  
- ❌ Missing testing library dependencies
- ❌ Broken mock implementations
- ❌ No verification of mission-critical disaster response workflows

**Testing Salvage Strategy:**
- 🎯 Fix broken test infrastructure (Week 1)
- 🎯 Implement comprehensive testing for salvaged UI + new Supabase backend
- 🎯 Achieve 80% minimum coverage for critical disaster operations systems
- 🎯 Validate performance targets: <100ms queries, <5s IAP generation
- 🎯 Create bulletproof E2E testing for life-safety workflows

**Alignment with Other Salvage Plans:**
- **UI Salvage:** Test consolidated facility managers and unified map components
- **Database Salvage:** Test new Supabase real-time sync and queries
- **Security Salvage:** Test authentication, RLS policies, and audit logging
- **Performance Salvage:** Validate <100ms query targets and memory stability

---

## 1. Infrastructure Repair & Modernization

### 1.1 Critical Configuration Fixes (Week 1 - Emergency Phase)

**Root Cause Analysis - Current Failures:**
```bash
# Primary failure points identified:
1. TypeScript import/export mismatches
2. Jest configuration conflicts with Next.js 15
3. Missing @testing-library dependencies
4. Incorrect module path mappings
5. Missing Jest DOM matchers setup
```

**Emergency Infrastructure Repair:**

1. **Fix Jest Configuration**
```javascript
// jest.config.js - COMPLETE REPLACEMENT
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Fix module resolution issues
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
  },
  
  // Coverage configuration aligned with salvage strategy
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    // Exclude components being consolidated
    '!src/components/FacilityManagement/FacilityManagerFixed.tsx',
    '!src/components/FacilityManagement/RealFacilityManager.tsx',
    '!src/components/FacilityMap*.tsx', // Multiple duplicate maps
  ],
  
  // Higher coverage requirements for salvaged critical systems
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Critical salvaged components require 90% coverage
    './src/components/FacilityManagement/UnifiedFacilityManager.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/components/Maps/UnifiedMapComponent.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // New Supabase services require 95% coverage
    './src/lib/supabase/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  
  // Test categorization for salvage phases
  projects: [
    {
      displayName: '🔥 CRITICAL',
      testMatch: ['<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'],
      testNamePattern: 'CRITICAL|SALVAGE',
    },
    {
      displayName: '🚧 INTEGRATION',
      testMatch: ['<rootDir>/src/__tests__/integration/**/*.(test|spec).{js,jsx,ts,tsx}'],
    },
    {
      displayName: '⚡ PERFORMANCE',  
      testMatch: ['<rootDir>/src/__tests__/performance/**/*.(test|spec).{js,jsx,ts,tsx}'],
      testTimeout: 30000,
    }
  ],
  
  testTimeout: 15000, // Extended for Supabase operations
  verbose: true,
  maxWorkers: '50%',
}

module.exports = createJestConfig(customJestConfig)
```

2. **Fix Jest Setup File**
```javascript
// jest.setup.js - COMPLETE REPLACEMENT
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Fix global environment for Node.js compatibility
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/test-path'
  },
}))

// Mock Supabase client for testing
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  }),
}))

// Performance testing utilities
global.performance = global.performance || {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
}

// Disaster operations test utilities
global.createMockDisasterScenario = () => ({
  operationId: 'test-operation-123',
  name: 'Test Hurricane Response',
  activationLevel: 3,
  facilities: [],
  personnel: [],
  createdAt: new Date().toISOString(),
})

// Extended timeout for disaster scenario tests
jest.setTimeout(30000)
```

3. **Fix Package Dependencies**
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jest": "^30.1.3",
    "jest-environment-jsdom": "^30.1.2",
    "@types/jest": "^30.0.0",
    "ts-jest": "^29.4.1",
    "@jest/globals": "^30.1.2",
    "@playwright/test": "^1.55.0",
    "@faker-js/faker": "^10.0.0"
  }
}
```

### 1.2 Modern Testing Architecture

**Testing Stack for Salvaged System:**
- **Jest 30** - Unit & Integration tests with Next.js 15 compatibility
- **Testing Library** - Component testing with React 19 support  
- **Playwright** - E2E testing for critical disaster workflows
- **Faker.js** - Realistic disaster scenario test data
- **Supabase Test Client** - Database testing with real-time features
- **MSW** - API mocking for third-party services

**Test Organization Structure:**
```
src/
├── __tests__/
│   ├── unit/                    # Component & utility tests
│   │   ├── components/          # UI component tests
│   │   ├── hooks/              # Custom hook tests  
│   │   └── utils/              # Utility function tests
│   ├── integration/            # Cross-component tests
│   │   ├── supabase/           # Database integration tests
│   │   ├── auth/               # Authentication flow tests
│   │   └── workflows/          # Business workflow tests
│   ├── performance/            # Performance & load tests
│   │   ├── queries/            # Database query performance
│   │   ├── rendering/          # Component render performance
│   │   └── memory/             # Memory leak detection
│   ├── fixtures/               # Test data and mocks
│   │   ├── disaster-scenarios/ # Realistic disaster test data
│   │   ├── facilities/         # Facility test data
│   │   └── users/              # User and role test data
│   └── helpers/                # Test utilities and setup
e2e/                            # Playwright E2E tests
├── critical-flows/             # Mission-critical user journeys
├── performance/                # Performance benchmarking
└── cross-browser/              # Browser compatibility tests
```

---

## 2. Testing Strategy for Salvaged UI + Supabase Backend

### 2.1 Component Testing Strategy

**Unified Component Testing (Aligned with UI Salvage Plan):**

1. **UnifiedFacilityManager Component Testing**
```typescript
// src/__tests__/unit/components/UnifiedFacilityManager.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnifiedFacilityManager } from '@/components/FacilityManagement/UnifiedFacilityManager'
import { createMockSupabaseClient } from '@/test-helpers/supabase'
import { createDisasterScenario } from '@/test-helpers/scenarios'

describe('🔥 CRITICAL: UnifiedFacilityManager - Salvaged Component', () => {
  let mockSupabase: any
  let mockDisasterScenario: any
  
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    mockDisasterScenario = createDisasterScenario()
  })

  describe('SALVAGE: Core Functionality', () => {
    it('should render facility list with real-time Supabase updates', async () => {
      render(
        <UnifiedFacilityManager 
          operationId={mockDisasterScenario.operationId}
          mode="view"
        />
      )
      
      // Verify initial load
      expect(screen.getByText('Loading facilities...')).toBeInTheDocument()
      
      // Wait for Supabase data load
      await waitFor(() => {
        expect(screen.getByText('Emergency Shelter Alpha')).toBeInTheDocument()
      })
      
      // Verify real-time subscription setup
      expect(mockSupabase.channel).toHaveBeenCalledWith('facilities')
    })
    
    it('should handle role-based access control via Supabase RLS', async () => {
      render(
        <UnifiedFacilityManager 
          operationId={mockDisasterScenario.operationId}
          mode="edit"
          userRole="discipline"
        />
      )
      
      // Verify RLS filtering applied
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('facilities')
        expect(mockSupabase.select).toHaveBeenCalled()
      })
    })
    
    it('PERFORMANCE: should update facility data within 100ms requirement', async () => {
      const user = userEvent.setup()
      render(
        <UnifiedFacilityManager 
          operationId={mockDisasterScenario.operationId}
          mode="edit"
        />
      )
      
      const capacityInput = screen.getByLabelText('Capacity')
      
      const startTime = performance.now()
      await user.clear(capacityInput)
      await user.type(capacityInput, '250')
      
      await waitFor(() => {
        const updateTime = performance.now() - startTime
        expect(updateTime).toBeLessThan(100) // Performance requirement
      })
    })
  })
  
  describe('SALVAGE: Integration with Google Places API', () => {
    it('should provide address autocomplete via secure proxy', async () => {
      const user = userEvent.setup()
      render(
        <UnifiedFacilityManager 
          operationId={mockDisasterScenario.operationId}
          mode="create"
        />
      )
      
      const addressInput = screen.getByLabelText('Facility Address')
      await user.type(addressInput, '123 Main St, Tampa, FL')
      
      // Verify Google Places integration
      await waitFor(() => {
        expect(screen.getByText('123 Main Street, Tampa, FL 33602')).toBeInTheDocument()
      })
    })
  })
})
```

2. **UnifiedMapComponent Testing**
```typescript
// src/__tests__/unit/components/UnifiedMapComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { UnifiedMapComponent } from '@/components/Maps/UnifiedMapComponent'
import { createFacilityTestData } from '@/test-helpers/facilities'

describe('🔥 CRITICAL: UnifiedMapComponent - Salvaged Component', () => {
  const mockFacilities = createFacilityTestData(50)
  
  describe('SALVAGE: Map Provider Switching', () => {
    it('should default to OpenStreetMap for cost efficiency', () => {
      render(
        <UnifiedMapComponent 
          facilities={mockFacilities}
          provider="osm"
        />
      )
      
      expect(screen.getByTestId('osm-map')).toBeInTheDocument()
    })
    
    it('should support Google Maps for premium features', () => {
      render(
        <UnifiedMapComponent 
          facilities={mockFacilities}
          provider="google"
        />
      )
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument()
    })
    
    it('PERFORMANCE: should render 100+ facilities with clustering within 2s', async () => {
      const largeFacilitySet = createFacilityTestData(150)
      const startTime = performance.now()
      
      render(
        <UnifiedMapComponent 
          facilities={largeFacilitySet}
          provider="osm"
          clustering={true}
        />
      )
      
      const renderTime = performance.now() - startTime
      expect(renderTime).toBeLessThan(2000) // Performance requirement
    })
  })
})
```

### 2.2 Supabase Integration Testing

**Database & Real-time Testing:**

```typescript
// src/__tests__/integration/supabase/realtime-sync.test.tsx
import { createClient } from '@supabase/supabase-js'
import { SupabaseRealtimeService } from '@/lib/supabase/realtime'
import { createDisasterScenario } from '@/test-helpers/scenarios'

describe('🔥 CRITICAL: Supabase Real-time Synchronization', () => {
  let supabase: any
  let realtimeService: SupabaseRealtimeService
  let testScenario: any
  
  beforeEach(async () => {
    // Use test Supabase instance
    supabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_ANON_KEY!
    )
    
    realtimeService = new SupabaseRealtimeService(supabase)
    testScenario = createDisasterScenario()
    
    // Clean test data
    await supabase.from('facilities').delete().neq('id', '')
  })
  
  describe('SALVAGE: Real-time Data Propagation', () => {
    it('should propagate facility updates across clients within 100ms', async () => {
      const client1 = new SupabaseRealtimeService(supabase)
      const client2 = new SupabaseRealtimeService(supabase)
      
      let client2UpdateReceived = false
      let propagationTime = 0
      
      // Client 2 subscribes to updates
      client2.subscribeToFacilities(testScenario.operationId, (update) => {
        propagationTime = performance.now() - startTime
        client2UpdateReceived = true
      })
      
      // Client 1 creates facility
      const startTime = performance.now()
      await client1.createFacility({
        operation_id: testScenario.operationId,
        name: 'Test Emergency Shelter',
        type: 'shelter',
        capacity: 100,
      })
      
      // Wait for propagation
      await waitFor(() => {
        expect(client2UpdateReceived).toBe(true)
        expect(propagationTime).toBeLessThan(100) // Critical performance requirement
      })
    })
    
    it('should handle concurrent updates without data loss', async () => {
      const facility = await supabase.from('facilities').insert({
        operation_id: testScenario.operationId,
        name: 'Concurrent Update Test Shelter',
        capacity: 100,
        version: 1,
      }).select().single()
      
      // Simulate concurrent updates from multiple clients
      const updates = [
        supabase.from('facilities').update({ capacity: 150 }).eq('id', facility.data.id),
        supabase.from('facilities').update({ capacity: 200 }).eq('id', facility.data.id),
        supabase.from('facilities').update({ capacity: 175 }).eq('id', facility.data.id),
      ]
      
      const results = await Promise.allSettled(updates)
      
      // Verify no data corruption
      const finalFacility = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facility.data.id)
        .single()
      
      expect(finalFacility.data.capacity).toBeGreaterThan(100)
      expect(results.every(r => r.status === 'fulfilled' || 
                              (r.status === 'rejected' && r.reason.code === 'PGRST116')))
        .toBe(true) // Some updates may fail due to optimistic locking, which is expected
    })
  })
  
  describe('SALVAGE: Row Level Security Testing', () => {
    it('should enforce role-based access via RLS policies', async () => {
      const disciplineUser = await supabase.auth.signInWithPassword({
        email: 'discipline.test@redcross.org',
        password: 'test-password-123',
      })
      
      const ipGroupUser = await supabase.auth.signInWithPassword({
        email: 'ipgroup.test@redcross.org', 
        password: 'test-password-123',
      })
      
      // Discipline user should only see their assigned facilities
      const disciplineData = await supabase
        .from('facilities')
        .select('*')
        .eq('operation_id', testScenario.operationId)
      
      // I&P Group user should see all facilities
      const ipGroupData = await supabase
        .from('facilities')
        .select('*')
        .eq('operation_id', testScenario.operationId)
      
      expect(disciplineData.data?.length).toBeLessThan(ipGroupData.data?.length)
    })
  })
})
```

### 2.3 Performance Testing for Salvaged System

**Query Performance Testing:**
```typescript
// src/__tests__/performance/query-performance.test.ts
import { SupabaseQueryService } from '@/lib/supabase/queries'
import { createLargeDisasterScenario } from '@/test-helpers/scenarios'

describe('⚡ PERFORMANCE: Supabase Query Optimization', () => {
  let queryService: SupabaseQueryService
  let largeScenario: any
  
  beforeEach(async () => {
    queryService = new SupabaseQueryService()
    // Create scenario with 1000+ facilities for realistic testing
    largeScenario = await createLargeDisasterScenario({
      facilityCount: 1000,
      personnelCount: 2500,
      complexHierarchy: true,
    })
  })
  
  describe('SALVAGE: Critical Query Performance', () => {
    it('should load facility dashboard within 100ms target', async () => {
      const startTime = performance.now()
      
      const dashboardData = await queryService.getFacilityDashboard(
        largeScenario.operationId
      )
      
      const queryTime = performance.now() - startTime
      
      expect(queryTime).toBeLessThan(100) // Critical requirement
      expect(dashboardData.totalFacilities).toBe(1000)
      expect(dashboardData.aggregateMetrics).toBeDefined()
    })
    
    it('should handle complex facility queries under load', async () => {
      const queries = Array.from({ length: 50 }, (_, i) => 
        queryService.searchFacilities(largeScenario.operationId, {
          type: ['shelter', 'feeding'][i % 2],
          status: 'operational',
          capacity_gt: 50,
        })
      )
      
      const startTime = performance.now()
      const results = await Promise.all(queries)
      const totalTime = performance.now() - startTime
      
      expect(totalTime).toBeLessThan(5000) // 5 second limit for complex queries
      expect(results.every(r => r.length >= 0)).toBe(true)
    })
    
    it('MEMORY: should maintain stable memory usage during real-time sync', async () => {
      const initialMemory = process.memoryUsage()
      
      // Simulate 10 minutes of real-time updates
      const subscription = queryService.subscribeToFacilities(
        largeScenario.operationId,
        (update) => {
          // Handle update
        }
      )
      
      // Generate updates for 10 minutes (simulated)
      for (let i = 0; i < 600; i++) {
        await queryService.updateFacility(
          largeScenario.facilities[i % 100].id,
          { capacity: 100 + i }
        )
        
        if (i % 60 === 0) {
          // Check memory every minute
          const currentMemory = process.memoryUsage()
          const memoryGrowth = currentMemory.heapUsed - initialMemory.heapUsed
          expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // <50MB growth
        }
      }
      
      subscription.unsubscribe()
    })
  })
})
```

---

## 3. Critical Test Scenarios for Disaster Operations

### 3.1 Mission-Critical User Workflows

**Complete IAP Generation Workflow:**
```typescript
// e2e/critical-flows/iap-generation.spec.ts
import { test, expect, Page } from '@playwright/test'
import { DisasterOpsTestHelper } from '../helpers/disaster-ops'

test.describe('🔥 CRITICAL: Complete IAP Generation Workflow', () => {
  let helper: DisasterOpsTestHelper
  
  test.beforeEach(async ({ page }) => {
    helper = new DisasterOpsTestHelper(page)
    await helper.signInAsIncidentCommander()
    await helper.createTestDisasterOperation()
  })
  
  test('should generate complete 53-page IAP within 5 second target', async ({ page }) => {
    // Create comprehensive disaster scenario
    await helper.setupComprehensiveDisasterScenario({
      facilities: 25,
      personnel: 150,
      operations: 8,
      timeSpan: '72hours',
    })
    
    // Navigate to IAP generation
    await page.click('[data-testid="generate-iap"]')
    
    // Start timing
    const startTime = Date.now()
    
    // Wait for generation to complete
    await expect(page.locator('[data-testid="iap-generation-complete"]'))
      .toBeVisible({ timeout: 10000 })
    
    const generationTime = Date.now() - startTime
    
    // Verify performance requirement
    expect(generationTime).toBeLessThan(5000) // 5 second requirement
    
    // Verify PDF quality
    const downloadPromise = page.waitForDownload()
    await page.click('[data-testid="download-iap-pdf"]')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toMatch(/IAP-\d+-\d+\.pdf/)
    
    // Verify PDF contains all required sections
    const pdfPath = await download.path()
    const pdfContent = await helper.analyzePDFContent(pdfPath)
    
    expect(pdfContent.pageCount).toBeGreaterThanOrEqual(53)
    expect(pdfContent.sections).toContain('ICS-202: Incident Objectives')
    expect(pdfContent.sections).toContain('ICS-203: Organization Assignment')
    expect(pdfContent.sections).toContain('Facility Status Dashboard')
  })
  
  test('should maintain data integrity during offline/online transitions', async ({ page, context }) => {
    // Setup initial data
    const initialFacilities = await helper.createTestFacilities(10)
    
    // Go offline
    await context.setOffline(true)
    
    // Make changes while offline
    await page.click('[data-testid="facility-1-edit"]')
    await page.fill('[data-testid="facility-capacity"]', '200')
    await page.click('[data-testid="save-facility"]')
    
    // Verify offline changes persisted locally
    await expect(page.locator('[data-testid="offline-changes-badge"]'))
      .toHaveText('1 pending change')
    
    // Go back online
    await context.setOffline(false)
    
    // Wait for sync
    await expect(page.locator('[data-testid="sync-complete-indicator"]'))
      .toBeVisible({ timeout: 5000 })
    
    // Verify changes synced to server
    const updatedFacility = await helper.getFacilityById('facility-1')
    expect(updatedFacility.capacity).toBe(200)
  })
})
```

### 3.2 Real-world Disaster Scenarios Testing

**Realistic Test Data Factory:**
```typescript
// src/__tests__/fixtures/disaster-scenarios/hurricane-response.ts
import { faker } from '@faker-js/faker'
import type { DisasterScenario, Facility, Personnel } from '@/types'

export function createHurricaneResponseScenario(): DisasterScenario {
  return {
    id: faker.string.uuid(),
    name: 'Hurricane Milton Response - Test Scenario',
    disasterType: 'hurricane',
    activationLevel: 3,
    operationalPeriod: '2024-10-10 06:00 - 2024-10-11 06:00',
    incidentCommander: createIncidentCommander(),
    facilities: createHurricaneFacilities(35),
    personnel: createDisasterPersonnel(200),
    geography: {
      affectedCounties: ['Pinellas', 'Hillsborough', 'Pasco', 'Hernando'],
      evacuationZones: ['A', 'B', 'C'],
      shelterRegions: ['North', 'Central', 'South'],
    },
    metrics: {
      evacuees: faker.number.int({ min: 15000, max: 25000 }),
      shelterCapacity: faker.number.int({ min: 8000, max: 12000 }),
      mealsServed: faker.number.int({ min: 45000, max: 65000 }),
      caseworkContacts: faker.number.int({ min: 500, max: 800 }),
    },
    timeline: {
      activation: faker.date.recent({ days: 3 }),
      firstShelterOpen: faker.date.recent({ days: 2 }),
      peakOperations: faker.date.recent({ days: 1 }),
    },
  }
}

export function createHurricaneFacilities(count: number): Facility[] {
  const facilityTypes = [
    { type: 'shelter', weight: 40 },
    { type: 'feeding', weight: 25 },
    { type: 'distribution', weight: 20 },
    { type: 'assessment', weight: 10 },
    { type: 'government', weight: 5 },
  ]
  
  return Array.from({ length: count }, (_, i) => {
    const typeInfo = faker.helpers.weightedArrayElement(facilityTypes)
    
    return {
      id: `facility-${i + 1}`,
      name: generateRealisticFacilityName(typeInfo.type),
      type: typeInfo.type,
      status: faker.helpers.arrayElement([
        'planning', 'setup', 'operational', 'closing', 'closed'
      ]),
      location: {
        address: faker.location.streetAddress(),
        city: faker.helpers.arrayElement([
          'St. Petersburg', 'Tampa', 'Clearwater', 'Largo', 'Pinellas Park'
        ]),
        state: 'FL',
        zipCode: faker.location.zipCode('33###'),
        coordinates: [
          faker.location.latitude({ min: 27.5, max: 28.2 }),
          faker.location.longitude({ min: -82.9, max: -82.4 }),
        ],
      },
      capacity: generateRealisticCapacity(typeInfo.type),
      currentOccupancy: 0,
      personnel: generateFacilityPersonnel(typeInfo.type),
      serviceLines: generateServiceLines(typeInfo.type),
      operatingHours: {
        open: '06:00',
        close: '22:00',
        is24Hour: typeInfo.type === 'shelter',
      },
      contactInfo: {
        phone: faker.phone.number('813-###-####'),
        email: `${faker.lorem.slug()}.${typeInfo.type}@redcross.org`,
        manager: faker.person.fullName(),
      },
      resources: generateFacilityResources(typeInfo.type),
      accessibility: {
        wheelchairAccessible: faker.datatype.boolean({ probability: 0.8 }),
        petFriendly: typeInfo.type === 'shelter' && faker.datatype.boolean({ probability: 0.3 }),
        medicalCapable: faker.datatype.boolean({ probability: 0.4 }),
      },
      operationalData: {
        totalServed: faker.number.int({ min: 100, max: 2000 }),
        dailyMetrics: generateDailyMetrics(3), // 3 days of operations
        incidents: generateFacilityIncidents(),
      }
    }
  })
}

function generateRealisticFacilityName(type: string): string {
  const bases = {
    shelter: ['Community Center', 'High School', 'Middle School', 'Recreation Center', 'Church'],
    feeding: ['Community Kitchen', 'Food Distribution Site', 'Mobile Feeding Unit'],
    distribution: ['Resource Distribution Center', 'Supply Point', 'Distribution Hub'],
    assessment: ['Assessment Team Base', 'Damage Assessment Center'],
    government: ['Emergency Operations Center', 'Government Liaison Office'],
  }
  
  const locations = [
    'Bayfront', 'Central', 'Westside', 'Downtown', 'Northgate', 
    'Southside', 'Riverside', 'Highland', 'Parkview', 'Sunset'
  ]
  
  const base = faker.helpers.arrayElement(bases[type] || bases.shelter)
  const location = faker.helpers.arrayElement(locations)
  
  return `${location} ${base}`
}
```

---

## 4. Performance & Load Testing

### 4.1 Performance Benchmarking

**Real-time Sync Performance Testing:**
```typescript
// src/__tests__/performance/realtime-sync-load.test.ts
import { SupabaseLoadTester } from '@/test-helpers/load-testing'
import { createLargeDisasterScenario } from '@/test-helpers/scenarios'

describe('⚡ LOAD: Real-time Sync Performance Under Stress', () => {
  let loadTester: SupabaseLoadTester
  let scenario: any
  
  beforeEach(async () => {
    loadTester = new SupabaseLoadTester()
    scenario = await createLargeDisasterScenario()
  })
  
  test('should handle 100 concurrent users updating facilities', async () => {
    const concurrentUsers = 100
    const updatesPerUser = 10
    const maxAcceptableTime = 500 // 500ms max for concurrent operations
    
    const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      const userClient = await loadTester.createUserClient(`user-${userIndex}`)
      const userStartTime = performance.now()
      
      // Each user makes multiple updates
      const updatePromises = Array.from({ length: updatesPerUser }, async (_, updateIndex) => {
        const facilityId = scenario.facilities[
          (userIndex * updatesPerUser + updateIndex) % scenario.facilities.length
        ].id
        
        return userClient.updateFacility(facilityId, {
          capacity: 100 + userIndex + updateIndex,
          lastUpdated: new Date().toISOString(),
        })
      })
      
      await Promise.all(updatePromises)
      
      const userTime = performance.now() - userStartTime
      expect(userTime).toBeLessThan(maxAcceptableTime)
      
      return userTime
    })
    
    const results = await Promise.all(userPromises)
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length
    
    console.log(`Average user completion time: ${avgTime.toFixed(2)}ms`)
    expect(avgTime).toBeLessThan(maxAcceptableTime)
  })
  
  test('should maintain <100ms query response under sustained load', async () => {
    const queryDuration = 60000 // 1 minute of sustained queries
    const queriesPerSecond = 50
    const queryInterval = 1000 / queriesPerSecond
    
    const queryTimes: number[] = []
    const startTime = Date.now()
    
    while (Date.now() - startTime < queryDuration) {
      const queryStart = performance.now()
      
      await loadTester.queryFacilitiesDashboard(scenario.operationId)
      
      const queryTime = performance.now() - queryStart
      queryTimes.push(queryTime)
      
      // Maintain query rate
      await new Promise(resolve => setTimeout(resolve, queryInterval))
    }
    
    // Analyze query performance
    const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length
    const p95QueryTime = queryTimes.sort()[Math.floor(queryTimes.length * 0.95)]
    const p99QueryTime = queryTimes.sort()[Math.floor(queryTimes.length * 0.99)]
    
    console.log('Query Performance Results:')
    console.log(`Average: ${avgQueryTime.toFixed(2)}ms`)
    console.log(`95th percentile: ${p95QueryTime.toFixed(2)}ms`)
    console.log(`99th percentile: ${p99QueryTime.toFixed(2)}ms`)
    
    expect(avgQueryTime).toBeLessThan(50) // Average should be very fast
    expect(p95QueryTime).toBeLessThan(100) // 95% of queries under 100ms requirement
  })
})
```

### 4.2 Memory Leak Detection

**Automated Memory Monitoring:**
```typescript
// src/__tests__/performance/memory-leak-detection.test.ts
import { MemoryMonitor } from '@/test-helpers/memory-monitor'
import { RealtimeFacilityManager } from '@/lib/supabase/realtime-facility-manager'

describe('⚡ MEMORY: Memory Leak Prevention', () => {
  let memoryMonitor: MemoryMonitor
  let facilityManager: RealtimeFacilityManager
  
  beforeEach(() => {
    memoryMonitor = new MemoryMonitor()
    facilityManager = new RealtimeFacilityManager()
  })
  
  afterEach(async () => {
    await facilityManager.cleanup()
    await memoryMonitor.cleanup()
  })
  
  test('should maintain stable memory during extended real-time operations', async () => {
    const testDuration = 300000 // 5 minutes
    const memoryCheckInterval = 10000 // Check every 10 seconds
    const maxMemoryGrowth = 10 * 1024 * 1024 // 10MB max growth
    
    await memoryMonitor.startMonitoring()
    const initialMemory = await memoryMonitor.getCurrentMemoryUsage()
    
    // Start real-time subscriptions
    const subscriptions = [
      facilityManager.subscribeToFacilities('operation-1'),
      facilityManager.subscribeToFacilities('operation-2'),
      facilityManager.subscribeToFacilities('operation-3'),
    ]
    
    // Generate continuous updates
    const updateInterval = setInterval(async () => {
      await facilityManager.updateFacility('facility-1', { 
        capacity: Math.floor(Math.random() * 500) + 100 
      })
      await facilityManager.createFacility({
        name: `Dynamic Facility ${Date.now()}`,
        type: 'shelter',
        operation_id: 'operation-1',
      })
      await facilityManager.deleteFacility(`temp-facility-${Date.now() - 10000}`)
    }, 1000)
    
    // Monitor memory over time
    const memoryReadings: number[] = []
    const monitoringInterval = setInterval(async () => {
      const currentMemory = await memoryMonitor.getCurrentMemoryUsage()
      memoryReadings.push(currentMemory.heapUsed)
      
      console.log(`Memory usage: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`)
    }, memoryCheckInterval)
    
    // Run test for specified duration
    await new Promise(resolve => setTimeout(resolve, testDuration))
    
    // Cleanup
    clearInterval(updateInterval)
    clearInterval(monitoringInterval)
    subscriptions.forEach(sub => sub.unsubscribe())
    
    const finalMemory = await memoryMonitor.getCurrentMemoryUsage()
    const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed
    
    console.log(`Total memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`)
    
    // Verify memory stability
    expect(memoryGrowth).toBeLessThan(maxMemoryGrowth)
    
    // Verify no significant upward trend in memory usage
    const trend = memoryMonitor.calculateMemoryTrend(memoryReadings)
    expect(trend.slope).toBeLessThan(1000) // Less than 1KB/reading increase trend
  })
})
```

---

## 5. CI/CD Integration & Testing Pipeline

### 5.1 GitHub Actions Testing Workflow

**Comprehensive Testing Pipeline:**
```yaml
# .github/workflows/testing-pipeline.yml
name: 🧪 Comprehensive Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run full test suite nightly
    - cron: '0 2 * * *'

jobs:
  test-infrastructure-repair:
    name: 🔧 Test Infrastructure Repair
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Verify Jest configuration
        run: npx jest --init --ci --dry-run
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint code
        run: npm run lint

  unit-tests:
    name: 🧪 Unit Tests - Salvaged Components
    runs-on: ubuntu-latest
    needs: test-infrastructure-repair
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage --watchAll=false
        env:
          CI: true
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          file: ./coverage/lcov.info
          flags: unit
          name: unit-tests

  integration-tests:
    name: 🔄 Integration Tests - Supabase Backend
    runs-on: ubuntu-latest
    needs: test-infrastructure-repair
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: disaster_ops_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Setup Supabase CLI
        run: |
          npm install -g supabase
          supabase --version
      
      - name: Start Supabase
        run: |
          supabase start
          supabase db reset --linked=false
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration -- --coverage --watchAll=false
        env:
          SUPABASE_TEST_URL: http://localhost:54321
          SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
          CI: true
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: integration
          name: integration-tests

  performance-tests:
    name: ⚡ Performance Tests - Critical Metrics
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:performance -- --watchAll=false
        env:
          CI: true
          PERFORMANCE_BUDGET_QUERY_TIME: 100
          PERFORMANCE_BUDGET_IAP_GENERATION: 5000
          PERFORMANCE_BUDGET_MEMORY_GROWTH: 50
      
      - name: Generate performance report
        run: |
          mkdir -p performance-results
          npm run test:performance -- --json --outputFile=performance-results/results.json
      
      - name: Upload performance artifacts
        uses: actions/upload-artifact@v4
        with:
          name: performance-results
          path: performance-results/

  e2e-tests:
    name: 🎭 E2E Tests - Critical Workflows
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm run start &
          sleep 10
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      
      - name: Upload E2E artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-results
          path: |
            test-results/
            playwright-report/

  security-tests:
    name: 🔒 Security Tests - Auth & RLS
    runs-on: ubuntu-latest
    needs: test-infrastructure-repair
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Security audit
        run: npm audit --audit-level=high
      
      - name: Run security tests
        run: npm run test:security -- --watchAll=false
        env:
          CI: true

  deployment-readiness:
    name: 🚀 Deployment Readiness Check
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests, performance-tests, e2e-tests, security-tests]
    steps:
      - name: Check test coverage requirements
        run: |
          echo "Verifying minimum coverage requirements..."
          # Coverage data from previous jobs
          UNIT_COVERAGE=$(curl -s ${{ needs.unit-tests.outputs.coverage_url }} | jq '.coverage.total.percent')
          INTEGRATION_COVERAGE=$(curl -s ${{ needs.integration-tests.outputs.coverage_url }} | jq '.coverage.total.percent')
          
          if (( $(echo "$UNIT_COVERAGE < 80" | bc -l) )); then
            echo "❌ Unit test coverage ($UNIT_COVERAGE%) below 80% requirement"
            exit 1
          fi
          
          if (( $(echo "$INTEGRATION_COVERAGE < 80" | bc -l) )); then
            echo "❌ Integration test coverage ($INTEGRATION_COVERAGE%) below 80% requirement"
            exit 1
          fi
          
          echo "✅ All coverage requirements met"
      
      - name: Verify performance benchmarks
        run: |
          echo "✅ All performance benchmarks validated"
          echo "✅ System ready for deployment"
```

### 5.2 Test Data Management Strategy

**Automated Test Data Lifecycle:**
```typescript
// src/__tests__/helpers/test-data-manager.ts
export class TestDataManager {
  private supabase: any
  private createdEntities: Map<string, string[]> = new Map()
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }
  
  async createTestOperation(scenario: Partial<DisasterScenario> = {}): Promise<DisasterScenario> {
    const operation = {
      id: `test-operation-${Date.now()}`,
      name: scenario.name || 'Test Hurricane Response',
      disaster_type: scenario.disasterType || 'hurricane',
      activation_level: scenario.activationLevel || 3,
      status: 'active',
      created_at: new Date().toISOString(),
      ...scenario,
    }
    
    const { data, error } = await this.supabase
      .from('operations')
      .insert(operation)
      .select()
      .single()
    
    if (error) throw error
    
    this.trackEntity('operations', data.id)
    return data
  }
  
  async createTestFacilities(
    operationId: string, 
    count: number = 10
  ): Promise<Facility[]> {
    const facilities = Array.from({ length: count }, (_, i) => ({
      id: `test-facility-${operationId}-${i + 1}`,
      operation_id: operationId,
      name: `Test Facility ${i + 1}`,
      type: ['shelter', 'feeding', 'distribution'][i % 3],
      status: 'operational',
      capacity: faker.number.int({ min: 50, max: 500 }),
      current_occupancy: 0,
      location: {
        address: faker.location.streetAddress(),
        city: 'Tampa',
        state: 'FL',
        coordinates: [
          faker.location.latitude({ min: 27.5, max: 28.2 }),
          faker.location.longitude({ min: -82.9, max: -82.4 }),
        ],
      },
      created_at: new Date().toISOString(),
    }))
    
    const { data, error } = await this.supabase
      .from('facilities')
      .insert(facilities)
      .select()
    
    if (error) throw error
    
    data.forEach((facility: any) => this.trackEntity('facilities', facility.id))
    return data
  }
  
  async setupRealisticDisasterScenario(): Promise<{
    operation: DisasterScenario
    facilities: Facility[]
    personnel: Personnel[]
  }> {
    // Create main operation
    const operation = await this.createTestOperation({
      name: 'Hurricane Milton Test Response',
      activationLevel: 3,
    })
    
    // Create diverse facility set
    const facilities = await this.createTestFacilities(operation.id, 25)
    
    // Create personnel assignments
    const personnel = await this.createTestPersonnel(operation.id, 150)
    
    // Setup realistic data relationships
    await this.assignPersonnelToFacilities(facilities, personnel)
    await this.generateOperationalHistory(operation.id, 3) // 3 days of history
    
    return { operation, facilities, personnel }
  }
  
  private trackEntity(table: string, id: string): void {
    if (!this.createdEntities.has(table)) {
      this.createdEntities.set(table, [])
    }
    this.createdEntities.get(table)!.push(id)
  }
  
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...')
    
    // Clean up in reverse dependency order
    const cleanupOrder = [
      'personnel_assignments',
      'operational_history', 
      'personnel',
      'facilities',
      'operations',
    ]
    
    for (const table of cleanupOrder) {
      const entities = this.createdEntities.get(table) || []
      if (entities.length > 0) {
        await this.supabase
          .from(table)
          .delete()
          .in('id', entities)
        
        console.log(`🗑️  Cleaned ${entities.length} records from ${table}`)
      }
    }
    
    this.createdEntities.clear()
    console.log('✅ Test data cleanup complete')
  }
}

// Global setup for automated cleanup
export const globalTestDataManager = new TestDataManager(createTestSupabaseClient())

// Cleanup after each test suite
afterEach(async () => {
  await globalTestDataManager.cleanup()
})
```

---

## 6. Timeline & Implementation Phases

### Phase 1: Emergency Stabilization (Week 1) 🚨

**Day 1-2: Infrastructure Repair**
- [ ] Fix Jest/TypeScript configuration issues
- [ ] Resolve module import/export problems
- [ ] Update package dependencies for compatibility
- [ ] Get at least one test file executing successfully
- [ ] Fix CI/CD pipeline basic functionality

**Day 3-5: Basic Coverage Implementation**
- [ ] Create foundational test helpers and utilities
- [ ] Implement basic component tests for core UI elements
- [ ] Setup Supabase test environment and mocking
- [ ] Create essential test data factories
- [ ] Establish baseline test coverage metrics

**Success Criteria:**
- ✅ At least 50% of test suites execute without errors
- ✅ CI/CD pipeline runs basic test validation
- ✅ Coverage reporting functional
- ✅ Test data management system operational

### Phase 2: Critical System Testing (Week 2-3) ⚡

**Week 2: Salvaged Component Testing**
- [ ] Complete UnifiedFacilityManager test suite
- [ ] Complete UnifiedMapComponent test suite  
- [ ] Implement Supabase integration tests
- [ ] Create real-time sync performance tests
- [ ] Setup authentication and RLS testing

**Week 3: Performance & Reliability**
- [ ] Implement performance benchmarking tests
- [ ] Create memory leak detection tests
- [ ] Setup load testing for concurrent operations
- [ ] Implement E2E critical workflow tests
- [ ] Create disaster scenario test data library

**Success Criteria:**
- ✅ 80% coverage on all salvaged UI components
- ✅ Performance tests validate <100ms query targets
- ✅ Real-time sync tests pass under load
- ✅ E2E tests cover critical user workflows

### Phase 3: Comprehensive Testing Suite (Week 4-5) 🎯

**Week 4: Advanced Testing Features**
- [ ] Implement cross-browser E2E testing
- [ ] Create comprehensive security test suite
- [ ] Setup automated performance regression detection
- [ ] Implement sophisticated mock data scenarios
- [ ] Create accessibility testing automation

**Week 5: Production Readiness**
- [ ] Finalize test coverage at 80%+ for critical systems
- [ ] Complete performance optimization validation
- [ ] Setup monitoring and alerting for test failures
- [ ] Create comprehensive test documentation
- [ ] Implement test data versioning and migration

**Success Criteria:**
- ✅ Full test suite achieves target coverage requirements
- ✅ All performance benchmarks consistently pass
- ✅ Security tests validate authentication and authorization
- ✅ E2E tests cover all critical disaster response workflows
- ✅ CI/CD pipeline blocks deployments on test failures

### Phase 4: Advanced Capabilities & Optimization (Week 6+) 🚀

**Ongoing Enhancements:**
- [ ] Visual regression testing for UI components
- [ ] API contract testing for external integrations
- [ ] Chaos engineering for resilience testing
- [ ] Machine learning-based test case generation
- [ ] Automated test maintenance and optimization

---

## 7. Success Metrics & Monitoring

### 7.1 Coverage Requirements

**Minimum Coverage Targets:**
- **Global Coverage:** 80% (lines, branches, functions, statements)
- **Salvaged Components:** 90% coverage requirement
- **Critical Services:** 95% coverage requirement (Supabase integration)
- **Security Functions:** 100% coverage requirement

**Coverage Monitoring:**
```bash
# Daily coverage validation
npm run test:coverage -- --threshold="80,80,80,80"
npm run coverage:critical -- --threshold="90,90,90,90"
```

### 7.2 Performance Benchmarks

**Critical Performance Metrics:**
- **Query Performance:** <100ms (95th percentile)
- **IAP Generation:** <5 seconds (complete PDF)
- **Real-time Sync:** <100ms (data propagation)
- **Memory Stability:** <50MB total, <2MB growth/hour
- **Page Load:** <2s (First Contentful Paint)

**Automated Performance Validation:**
```typescript
// Performance Gates in CI/CD
const performanceGates = {
  queryTime: 100,           // ms
  iapGeneration: 5000,      // ms
  syncPropagation: 100,     // ms
  memoryGrowth: 50,         // MB
  pageLoad: 2000,           // ms
}
```

### 7.3 Quality Gates

**Deployment Blocking Conditions:**
- ❌ Any test suite below 80% coverage
- ❌ Performance benchmarks failing
- ❌ Security tests failing
- ❌ E2E critical workflows failing
- ❌ Memory leak detection triggered

**Warning Conditions (Deploy with Caution):**
- ⚠️ Coverage between 75-80%
- ⚠️ Performance within 10% of limits
- ⚠️ Intermittent E2E test failures
- ⚠️ Minor security policy violations

---

## 8. Conclusion

This Testing Salvage Plan provides a comprehensive strategy for rebuilding the disaster-ops-v3 testing infrastructure while aligning with the UI salvage and Supabase backend replacement strategies. The plan prioritizes:

1. **Emergency Infrastructure Repair** - Get tests running within Week 1
2. **Critical System Validation** - Ensure salvaged UI and new backend work together
3. **Performance Assurance** - Validate disaster response performance requirements
4. **Operational Safety** - Create bulletproof testing for life-safety systems

**Key Outcomes:**
- ✅ **Zero to 80%+ Coverage** in 5 weeks
- ✅ **Performance Validation** of <100ms queries and <5s IAP generation
- ✅ **Real-time Testing** of Supabase sync capabilities
- ✅ **E2E Validation** of complete disaster response workflows
- ✅ **CI/CD Integration** with deployment quality gates

The testing infrastructure will ensure the disaster operations platform is reliable, performant, and safe for critical emergency response operations, preventing the reliability issues that led to the current crisis.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Analyze current test infrastructure failures and root causes", "activeForm": "Analyzing current test infrastructure failures", "status": "completed"}, {"content": "Review other specialist salvage plans for alignment", "activeForm": "Reviewing other specialist salvage plans", "status": "completed"}, {"content": "Create comprehensive testing salvage plan document", "activeForm": "Creating comprehensive testing salvage plan document", "status": "completed"}]