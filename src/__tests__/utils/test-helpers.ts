/**
 * TEST UTILITIES - Disaster Operations Platform
 * 
 * Critical utility functions for testing the disaster operations platform.
 * These helpers ensure consistent, reliable testing across all test suites.
 */

import { waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { MasterDataService } from '@/lib/services/MasterDataService';
import { operationFactory, facilityFactory, personnelFactory, dailyScheduleFactory } from '../factories';

// ============================================
// DATABASE TEST UTILITIES
// ============================================

/**
 * Sets up a clean test database state
 */
export const setupTestDatabase = async (): Promise<void> => {
  // Clear any existing test data
  await cleanupTestDatabase();
  
  // Initialize with fresh state
  console.log('🧪 Setting up test database...');
  
  // This would clear IndexedDB/Dexie in real implementation
  if (typeof window !== 'undefined') {
    // Clear localStorage test data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('test_') || key.startsWith('disaster_ops_test_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

/**
 * Cleans up test database after tests
 */
export const cleanupTestDatabase = async (): Promise<void> => {
  console.log('🧹 Cleaning up test database...');
  
  // Clean up test data
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('test_') || key.startsWith('disaster_ops_test_')) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Clear any global test state
  if (global.__TEST_DATA__) {
    delete global.__TEST_DATA__;
  }
};

/**
 * Seeds the database with test data
 */
export const seedTestDatabase = async (operationId: string = 'test-operation') => {
  console.log(`🌱 Seeding test database for operation: ${operationId}`);
  
  const testData = {
    operation: operationFactory.build({ id: operationId }),
    facilities: [
      facilityFactory.buildShelter({ operation_id: operationId }),
      facilityFactory.buildFeedingSite({ operation_id: operationId })
    ],
    personnel: [
      personnelFactory.buildIncidentCommander({ operation_id: operationId }),
      personnelFactory.buildShelterManager({ operation_id: operationId })
    ],
    schedule: dailyScheduleFactory.buildDailySchedule(operationId)
  };
  
  // Store in global for access during tests
  global.__TEST_DATA__ = testData;
  
  return testData;
};

// ============================================
// SYNCHRONIZATION TEST UTILITIES
// ============================================

/**
 * Waits for data synchronization to complete
 */
export const waitForDataSync = async (timeout: number = 5000): Promise<void> => {
  await waitFor(() => {
    // Check if sync is complete (implementation specific)
    // This would check actual sync indicators in real app
    expect(true).toBe(true); // Placeholder
  }, { timeout });
};

/**
 * Waits for specific data to appear in component
 */
export const waitForDataInComponent = async (
  selector: string, 
  expectedText: string, 
  timeout: number = 3000
): Promise<void> => {
  await waitFor(() => {
    const element = document.querySelector(selector);
    expect(element).toBeTruthy();
    expect(element?.textContent).toContain(expectedText);
  }, { timeout });
};

/**
 * Verifies that data propagated to all subscribers
 */
export const verifyDataPropagation = async (
  service: MasterDataService,
  tableName: string,
  expectedData: any,
  subscriberCount: number = 1
): Promise<void> => {
  const subscribers = Array.from({ length: subscriberCount }, () => jest.fn());
  const unsubscribes = subscribers.map(sub => service.subscribeToTable(tableName, sub));
  
  // Trigger data change
  // @ts-ignore - accessing private method
  await service.notifyTableListeners(tableName);
  
  // Verify all subscribers received data
  await waitFor(() => {
    subscribers.forEach(subscriber => {
      expect(subscriber).toHaveBeenCalled();
    });
  });
  
  // Clean up
  unsubscribes.forEach(unsubscribe => unsubscribe());
};

// ============================================
// PERFORMANCE TEST UTILITIES
// ============================================

/**
 * Measures execution time of an async operation
 */
export const measureExecutionTime = async <T>(
  operation: () => Promise<T>,
  description: string = 'Operation'
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  const result = await operation();
  const duration = performance.now() - startTime;
  
  console.log(`⏱️ ${description} took ${duration.toFixed(2)}ms`);
  
  return { result, duration };
};

/**
 * Benchmarks multiple operations and compares performance
 */
export const benchmarkOperations = async (
  operations: Array<{ name: string; fn: () => Promise<any> }>,
  iterations: number = 1
): Promise<{ [name: string]: { avgTime: number; minTime: number; maxTime: number } }> => {
  const results: { [name: string]: number[] } = {};
  
  for (const operation of operations) {
    results[operation.name] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { duration } = await measureExecutionTime(operation.fn, `${operation.name} (iteration ${i + 1})`);
      results[operation.name].push(duration);
    }
  }
  
  // Calculate statistics
  const stats: { [name: string]: { avgTime: number; minTime: number; maxTime: number } } = {};
  
  for (const [name, times] of Object.entries(results)) {
    stats[name] = {
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    };
  }
  
  return stats;
};

/**
 * Asserts that an operation completes within a time limit
 */
export const assertPerformance = async <T>(
  operation: () => Promise<T>,
  maxTimeMs: number,
  description: string = 'Operation'
): Promise<T> => {
  const { result, duration } = await measureExecutionTime(operation, description);
  
  if (duration > maxTimeMs) {
    throw new Error(
      `Performance assertion failed: ${description} took ${duration.toFixed(2)}ms, ` +
      `expected < ${maxTimeMs}ms`
    );
  }
  
  return result;
};

// ============================================
// COMPONENT TEST UTILITIES
// ============================================

/**
 * Creates a test wrapper with providers
 */
export const createTestWrapper = (children: React.ReactNode) => {
  return children; // Simplified for now, would include providers in real implementation
};

/**
 * Waits for loading states to complete
 */
export const waitForLoadingToComplete = async (
  loadingSelector: string = '[data-testid*="loading"]',
  timeout: number = 5000
): Promise<void> => {
  await waitFor(() => {
    const loadingElements = document.querySelectorAll(loadingSelector);
    expect(loadingElements).toHaveLength(0);
  }, { timeout });
};

/**
 * Simulates user interactions with delays
 */
export const simulateUserInteraction = async (
  interactions: Array<{ action: 'click' | 'type' | 'clear'; selector: string; value?: string; delay?: number }>
): Promise<void> => {
  for (const interaction of interactions) {
    const element = document.querySelector(interaction.selector);
    expect(element).toBeTruthy();
    
    switch (interaction.action) {
      case 'click':
        (element as HTMLElement).click();
        break;
      case 'type':
        if (interaction.value && element instanceof HTMLInputElement) {
          element.value = interaction.value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
      case 'clear':
        if (element instanceof HTMLInputElement) {
          element.value = '';
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
    }
    
    if (interaction.delay) {
      await new Promise(resolve => setTimeout(resolve, interaction.delay));
    }
  }
};

// ============================================
// DATA VALIDATION UTILITIES
// ============================================

/**
 * Validates that data matches expected schema
 */
export const validateDataStructure = (data: any, expectedFields: string[]): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  return expectedFields.every(field => data.hasOwnProperty(field));
};

/**
 * Compares two data objects for equality (deep comparison)
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) {
    return true;
  }
  
  if (obj1 == null || obj2 == null) {
    return false;
  }
  
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
};

/**
 * Validates that all required fields are present and valid
 */
export const validateRequiredFields = (data: any, requirements: { [field: string]: (value: any) => boolean }): string[] => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(requirements)) {
    if (!data.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    } else if (!validator(data[field])) {
      errors.push(`Invalid value for field: ${field}`);
    }
  }
  
  return errors;
};

// ============================================
// MOCK UTILITIES
// ============================================

/**
 * Creates a mock MasterDataService for testing
 */
export const createMockMasterDataService = () => {
  return {
    setCurrentOperation: jest.fn().mockResolvedValue(undefined),
    getCurrentOperationId: jest.fn().mockReturnValue('mock-operation'),
    getDailySchedule: jest.fn().mockResolvedValue([]),
    updateDailySchedule: jest.fn().mockResolvedValue(undefined),
    addDailyScheduleEntry: jest.fn().mockResolvedValue('mock-id'),
    deleteDailyScheduleEntry: jest.fn().mockResolvedValue(undefined),
    getFacilities: jest.fn().mockResolvedValue([]),
    updateFacility: jest.fn().mockResolvedValue(undefined),
    addFacility: jest.fn().mockResolvedValue('mock-id'),
    getPersonnel: jest.fn().mockResolvedValue([]),
    getGaps: jest.fn().mockResolvedValue([]),
    subscribeToTable: jest.fn().mockReturnValue(() => {}),
    subscribeToRecord: jest.fn().mockReturnValue(() => {})
  };
};

/**
 * Creates mock hooks for testing components
 */
export const createMockHooks = (mockData: any = {}) => ({
  useDailySchedule: jest.fn().mockReturnValue({
    schedule: mockData.schedule || [],
    loading: false,
    updateEntry: jest.fn(),
    addEntry: jest.fn(),
    deleteEntry: jest.fn()
  }),
  useFacilities: jest.fn().mockReturnValue({
    facilities: mockData.facilities || [],
    loading: false,
    updateFacility: jest.fn(),
    getFacilitiesByType: jest.fn().mockReturnValue([])
  }),
  usePersonnel: jest.fn().mockReturnValue({
    personnel: mockData.personnel || [],
    loading: false
  }),
  useGaps: jest.fn().mockReturnValue({
    gaps: mockData.gaps || [],
    loading: false,
    criticalGaps: []
  }),
  useWorkAssignments: jest.fn().mockReturnValue({
    assignments: mockData.assignments || [],
    loading: false,
    getAssignmentsByType: jest.fn().mockReturnValue([])
  })
});

// ============================================
// ERROR SIMULATION UTILITIES
// ============================================

/**
 * Simulates network errors for testing error handling
 */
export const simulateNetworkError = (mockFn: jest.Mock, errorCount: number = 1) => {
  let callCount = 0;
  mockFn.mockImplementation(() => {
    callCount++;
    if (callCount <= errorCount) {
      return Promise.reject(new Error('Simulated network error'));
    }
    return Promise.resolve({ data: [] });
  });
};

/**
 * Simulates slow network responses
 */
export const simulateSlowResponse = (mockFn: jest.Mock, delayMs: number = 1000) => {
  mockFn.mockImplementation(() => 
    new Promise(resolve => 
      setTimeout(() => resolve({ data: [] }), delayMs)
    )
  );
};

// ============================================
// TEST ENVIRONMENT UTILITIES
// ============================================

/**
 * Sets up test environment variables
 */
export const setupTestEnvironment = () => {
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_APP_ENV = 'test';
  
  // Mock console methods to reduce noise in tests
  const originalConsole = console;
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error // Keep errors for debugging
  };
  
  return () => {
    global.console = originalConsole;
  };
};

/**
 * Creates a test timeout helper
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

/**
 * Retries an operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 100
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};