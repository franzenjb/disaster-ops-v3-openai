/**
 * CRITICAL PERFORMANCE TESTS: Real-time Synchronization Performance
 * 
 * These tests verify that the disaster operations platform meets
 * critical performance requirements during active disaster response.
 * Slow performance during emergencies can cost lives.
 * 
 * PERFORMANCE REQUIREMENTS:
 * - Data propagation: < 100ms
 * - Large dataset handling: < 5 seconds  
 * - Concurrent operations: < 500ms
 * - Memory usage: Stable under load
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { performance } from 'perf_hooks';
import { MasterDataService, DailyScheduleEntry, Facility, Personnel } from '@/lib/services/MasterDataService';

// Mock dependencies for performance testing
jest.mock('../../lib/sync/EventBus');
jest.mock('../../lib/database/DatabaseManager');

import { eventBus } from '../../lib/sync/EventBus';
import { DatabaseManager } from '../../lib/database/DatabaseManager';

describe('🔥 CRITICAL: Real-time Synchronization Performance', () => {
  let service: MasterDataService;
  let mockDb: jest.Mocked<DatabaseManager>;
  let mockEventBus: jest.Mocked<typeof eventBus>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fast database responses for performance testing
    mockDb = {
      query: jest.fn().mockResolvedValue({ data: null }),
      write: jest.fn().mockResolvedValue(undefined),
      appendEvent: jest.fn().mockResolvedValue(undefined),
      getInstance: jest.fn(),
    } as any;

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      off: jest.fn(),
    } as any;

    (DatabaseManager.getInstance as jest.Mock).mockReturnValue(mockDb);
    (eventBus.emit as jest.Mock) = mockEventBus.emit;

    service = MasterDataService.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // CRITICAL: Data Propagation Speed
  // ============================================

  describe('🔥 CRITICAL: Data Propagation Performance', () => {
    it('should propagate daily schedule changes within 100ms - CRITICAL', async () => {
      await service.setCurrentOperation('perf-test-op');

      const startTime = performance.now();

      const scheduleEntry: DailyScheduleEntry = {
        id: 'perf-schedule-1',
        operation_id: 'perf-test-op',
        time: '08:00',
        event_name: 'Performance Test Briefing',
        event_type: 'briefing'
      };

      await service.updateDailySchedule(scheduleEntry);

      const propagationTime = performance.now() - startTime;

      // CRITICAL: Must complete within 100ms for real-time operations
      expect(propagationTime).toBeLessThan(100);

      // Verify database and event bus were called
      expect(mockDb.write).toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalled();
    });

    it('should propagate facility updates within 100ms - CRITICAL', async () => {
      await service.setCurrentOperation('perf-test-op');

      const startTime = performance.now();

      const facility: Facility = {
        id: 'perf-facility-1',
        operation_id: 'perf-test-op',
        facility_type: 'shelter',
        name: 'Performance Test Shelter',
        status: 'open',
        capacity: { maximum: 200, current: 50 }
      };

      await service.updateFacility(facility);

      const propagationTime = performance.now() - startTime;

      // CRITICAL: Real-time facility updates must be fast
      expect(propagationTime).toBeLessThan(100);

      expect(mockDb.write).toHaveBeenCalledWith('facilities', 'put', expect.objectContaining({
        id: 'perf-facility-1',
        name: 'Performance Test Shelter'
      }));
    });

    it('should handle rapid sequential updates efficiently - CRITICAL', async () => {
      await service.setCurrentOperation('perf-test-op');

      const startTime = performance.now();

      // Perform 10 rapid updates
      const updates = Array.from({ length: 10 }, (_, i) => 
        service.updateDailySchedule({
          id: `rapid-update-${i}`,
          operation_id: 'perf-test-op',
          time: `${8 + i}:00`,
          event_name: `Rapid Update ${i}`,
          event_type: 'meeting'
        })
      );

      await Promise.all(updates);

      const totalTime = performance.now() - startTime;

      // CRITICAL: 10 updates should complete within 500ms
      expect(totalTime).toBeLessThan(500);

      // All updates should have been processed
      expect(mockDb.write).toHaveBeenCalledTimes(10);
      expect(mockEventBus.emit).toHaveBeenCalledTimes(10);
    });
  });

  // ============================================
  // CRITICAL: Concurrent Operation Performance
  // ============================================

  describe('🔥 CRITICAL: Concurrent Operation Performance', () => {
    it('should handle 50 concurrent subscribers efficiently - CRITICAL', async () => {
      const subscribers: jest.Mock[] = [];
      const unsubscribeFunctions: (() => void)[] = [];

      // Create 50 subscribers
      for (let i = 0; i < 50; i++) {
        const subscriber = jest.fn();
        subscribers.push(subscriber);
        const unsubscribe = service.subscribeToTable('daily_schedule', subscriber);
        unsubscribeFunctions.push(unsubscribe);
      }

      const startTime = performance.now();

      // Simulate a data change that should notify all subscribers
      mockDb.query.mockResolvedValue({ data: [] });

      // @ts-ignore - accessing private method for testing
      await service.notifyTableListeners('daily_schedule');

      const notificationTime = performance.now() - startTime;

      // CRITICAL: Notifying 50 subscribers should be fast
      expect(notificationTime).toBeLessThan(100);

      // Clean up subscriptions
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    });

    it('should handle concurrent database operations - CRITICAL', async () => {
      await service.setCurrentOperation('concurrent-test-op');

      const startTime = performance.now();

      // Perform concurrent operations of different types
      const operations = [
        service.addDailyScheduleEntry({
          operation_id: 'concurrent-test-op',
          time: '09:00',
          event_name: 'Concurrent Schedule 1'
        }),
        service.addFacility({
          operation_id: 'concurrent-test-op',
          facility_type: 'shelter',
          name: 'Concurrent Facility 1',
          status: 'planned'
        }),
        service.addDailyScheduleEntry({
          operation_id: 'concurrent-test-op',
          time: '10:00',
          event_name: 'Concurrent Schedule 2'
        }),
        service.addFacility({
          operation_id: 'concurrent-test-op',
          facility_type: 'feeding',
          name: 'Concurrent Facility 2',
          status: 'open'
        })
      ];

      await Promise.all(operations);

      const totalTime = performance.now() - startTime;

      // CRITICAL: Concurrent operations should complete quickly
      expect(totalTime).toBeLessThan(300);

      // All operations should have been processed
      expect(mockDb.write).toHaveBeenCalledTimes(4);
    });

    it('should maintain performance under subscriber churn - CRITICAL', async () => {
      const testDuration = 1000; // 1 second test
      const startTime = performance.now();

      // Simulate rapid subscribe/unsubscribe activity
      while (performance.now() - startTime < testDuration) {
        // Subscribe 10 listeners
        const unsubscribes = Array.from({ length: 10 }, () => 
          service.subscribeToTable('facilities', jest.fn())
        );

        // Trigger notifications
        mockDb.query.mockResolvedValue({ data: [] });
        // @ts-ignore
        await service.notifyTableListeners('facilities');

        // Unsubscribe all
        unsubscribes.forEach(unsubscribe => unsubscribe());
      }

      // Test should complete without memory leaks or performance degradation
      expect(performance.now() - startTime).toBeLessThan(testDuration + 100);
    });
  });

  // ============================================
  // CRITICAL: Large Dataset Performance
  // ============================================

  describe('🔥 CRITICAL: Large Dataset Handling', () => {
    it('should handle 1000 facility records efficiently - CRITICAL', async () => {
      await service.setCurrentOperation('large-dataset-test');

      // Mock large dataset
      const largeFacilityDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `facility-${i}`,
        name: `Test Facility ${i}`,
        facility_type: 'shelter' as const,
        status: 'planned' as const,
        operation_id: 'large-dataset-test'
      }));

      mockDb.query.mockResolvedValue({ data: largeFacilityDataset });

      const startTime = performance.now();

      const facilities = await service.getFacilities();

      const queryTime = performance.now() - startTime;

      // CRITICAL: Querying 1000 records should be fast
      expect(queryTime).toBeLessThan(100);
      expect(facilities).toHaveLength(1000);
    });

    it('should handle bulk operations efficiently - CRITICAL', async () => {
      await service.setCurrentOperation('bulk-test-op');

      const startTime = performance.now();

      // Create 100 schedule entries rapidly
      const bulkOperations = Array.from({ length: 100 }, (_, i) =>
        service.addDailyScheduleEntry({
          operation_id: 'bulk-test-op',
          time: `${8 + (i % 12)}:${(i % 60).toString().padStart(2, '0')}`,
          event_name: `Bulk Event ${i}`,
          event_type: 'operation'
        })
      );

      await Promise.all(bulkOperations);

      const bulkTime = performance.now() - startTime;

      // CRITICAL: 100 bulk operations should complete within 5 seconds
      expect(bulkTime).toBeLessThan(5000);

      // All operations should have been processed
      expect(mockDb.write).toHaveBeenCalledTimes(100);
    });

    it('should maintain search performance with large datasets - CRITICAL', async () => {
      await service.setCurrentOperation('search-perf-test');

      // Mock large personnel dataset
      const largePersonnelDataset = Array.from({ length: 500 }, (_, i) => ({
        id: `person-${i}`,
        first_name: `FirstName${i}`,
        last_name: `LastName${i}`,
        operation_id: 'search-perf-test'
      }));

      mockDb.query.mockResolvedValue({ data: largePersonnelDataset });

      const startTime = performance.now();

      // Simulate search/filter operation
      const personnel = await service.getPersonnel();

      const searchTime = performance.now() - startTime;

      // CRITICAL: Searching through 500 personnel records should be fast
      expect(searchTime).toBeLessThan(50);
      expect(personnel).toHaveLength(500);
    });
  });

  // ============================================
  // CRITICAL: Memory Usage and Cleanup
  // ============================================

  describe('🔥 CRITICAL: Memory Management Performance', () => {
    it('should not leak memory with many subscriptions - CRITICAL', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const subscriptions: (() => void)[] = [];

      // Create many subscriptions
      for (let i = 0; i < 1000; i++) {
        const unsubscribe = service.subscribeToTable('test_table', jest.fn());
        subscriptions.push(unsubscribe);
      }

      const afterSubscribeMemory = process.memoryUsage().heapUsed;

      // Clean up all subscriptions
      subscriptions.forEach(unsubscribe => unsubscribe());

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterCleanupMemory = process.memoryUsage().heapUsed;

      // Memory should not grow indefinitely
      const memoryGrowth = afterCleanupMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });

    it('should handle rapid operation context switching - CRITICAL', async () => {
      const startTime = performance.now();

      // Switch operation context 50 times rapidly
      for (let i = 0; i < 50; i++) {
        await service.setCurrentOperation(`rapid-switch-${i}`);
      }

      const switchTime = performance.now() - startTime;

      // CRITICAL: Context switching should be fast
      expect(switchTime).toBeLessThan(500);

      // Should have emitted context change events
      expect(mockEventBus.emit).toHaveBeenCalledTimes(50);
    });

    it('should maintain performance with long-running subscriptions - CRITICAL', async () => {
      // Create long-term subscription
      const longTermSubscriber = jest.fn();
      const unsubscribe = service.subscribeToTable('long_term_test', longTermSubscriber);

      const iterations = 1000;
      const startTime = performance.now();

      // Simulate many notifications over time
      for (let i = 0; i < iterations; i++) {
        mockDb.query.mockResolvedValue({ data: [{ id: i }] });
        // @ts-ignore
        await service.notifyTableListeners('long_term_test');
      }

      const totalTime = performance.now() - startTime;

      // CRITICAL: Should maintain consistent performance
      expect(totalTime).toBeLessThan(1000); // 1 second for 1000 notifications
      expect(longTermSubscriber).toHaveBeenCalledTimes(iterations);

      unsubscribe();
    });
  });

  // ============================================
  // CRITICAL: Network and I/O Performance
  // ============================================

  describe('🔥 CRITICAL: Network and I/O Performance Simulation', () => {
    it('should handle slow database responses gracefully - CRITICAL', async () => {
      // Mock slow database response
      mockDb.query.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );

      await service.setCurrentOperation('slow-db-test');

      const startTime = performance.now();

      const result = await service.getDailySchedule();

      const totalTime = performance.now() - startTime;

      // Should handle slow DB gracefully
      expect(totalTime).toBeGreaterThan(100); // At least as long as DB delay
      expect(totalTime).toBeLessThan(200); // But not much longer
      expect(result).toEqual([]);
    });

    it('should batch multiple rapid writes efficiently - CRITICAL', async () => {
      await service.setCurrentOperation('batch-test-op');

      // Track call timing
      const writeTimes: number[] = [];
      mockDb.write.mockImplementation(async () => {
        writeTimes.push(performance.now());
        return undefined;
      });

      const startTime = performance.now();

      // Make 20 rapid writes
      const writes = Array.from({ length: 20 }, (_, i) =>
        service.addDailyScheduleEntry({
          operation_id: 'batch-test-op',
          time: `${8 + (i % 12)}:00`,
          event_name: `Batch Write ${i}`
        })
      );

      await Promise.all(writes);

      const totalTime = performance.now() - startTime;

      // Should complete quickly
      expect(totalTime).toBeLessThan(500);

      // All writes should have been executed
      expect(mockDb.write).toHaveBeenCalledTimes(20);
    });

    it('should maintain performance during error conditions - CRITICAL', async () => {
      await service.setCurrentOperation('error-perf-test');

      // Mock intermittent failures
      let callCount = 0;
      mockDb.write.mockImplementation(async () => {
        callCount++;
        if (callCount % 3 === 0) {
          throw new Error('Simulated database error');
        }
        return undefined;
      });

      const startTime = performance.now();

      // Attempt multiple operations, some will fail
      const operations = Array.from({ length: 15 }, (_, i) =>
        service.addDailyScheduleEntry({
          operation_id: 'error-perf-test',
          time: `${9 + (i % 10)}:00`,
          event_name: `Error Test ${i}`
        }).catch(() => null) // Catch errors to continue test
      );

      await Promise.all(operations);

      const totalTime = performance.now() - startTime;

      // Should handle errors without major performance impact
      expect(totalTime).toBeLessThan(1000);

      // Should have attempted all operations
      expect(mockDb.write).toHaveBeenCalledTimes(15);
    });
  });

  // ============================================
  // CRITICAL: Real-world Load Simulation
  // ============================================

  describe('🔥 CRITICAL: Real-world Emergency Load Simulation', () => {
    it('should handle emergency operation load - CRITICAL', async () => {
      await service.setCurrentOperation('emergency-load-test');

      const startTime = performance.now();

      // Simulate emergency scenario:
      // - 10 facilities being updated rapidly
      // - 20 personnel assignments changing
      // - 15 schedule updates
      // - 50 subscribers listening for changes

      // Set up subscribers
      const subscribers = Array.from({ length: 50 }, () => jest.fn());
      const unsubscribes = subscribers.map(subscriber => 
        service.subscribeToTable('emergency_updates', subscriber)
      );

      // Concurrent emergency updates
      const emergencyUpdates = [
        // Facility updates
        ...Array.from({ length: 10 }, (_, i) =>
          service.addFacility({
            operation_id: 'emergency-load-test',
            facility_type: 'shelter',
            name: `Emergency Shelter ${i}`,
            status: 'open'
          })
        ),

        // Schedule updates
        ...Array.from({ length: 15 }, (_, i) =>
          service.addDailyScheduleEntry({
            operation_id: 'emergency-load-test',
            time: `${8 + (i % 16)}:${(i * 4) % 60}`.padEnd(5, '0'),
            event_name: `Emergency Event ${i}`,
            event_type: 'operation'
          })
        )
      ];

      await Promise.all(emergencyUpdates);

      const emergencyLoadTime = performance.now() - startTime;

      // CRITICAL: Emergency load should be handled within 2 seconds
      expect(emergencyLoadTime).toBeLessThan(2000);

      // All operations should succeed
      expect(mockDb.write).toHaveBeenCalledTimes(25); // 10 facilities + 15 schedule entries

      // Clean up
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });

    it('should maintain consistency under extreme load - CRITICAL', async () => {
      await service.setCurrentOperation('extreme-load-test');

      const operations = 100;
      const startTime = performance.now();

      // Extreme load: 100 concurrent operations with subscribers
      const subscribers = Array.from({ length: 20 }, () => jest.fn());
      const unsubscribes = subscribers.map(sub => 
        service.subscribeToTable('extreme_load', sub)
      );

      const extremeLoad = Array.from({ length: operations }, (_, i) => {
        const type = i % 3;
        switch (type) {
          case 0:
            return service.addDailyScheduleEntry({
              operation_id: 'extreme-load-test',
              time: `${8 + (i % 16)}:00`,
              event_name: `Extreme Load Event ${i}`
            });
          case 1:
            return service.addFacility({
              operation_id: 'extreme-load-test',
              facility_type: 'shelter',
              name: `Extreme Load Facility ${i}`,
              status: 'planned'
            });
          default:
            return service.addGap({
              operation_id: 'extreme-load-test',
              gap_type: 'personnel',
              quantity_needed: 5,
              priority: 'medium'
            });
        }
      });

      await Promise.all(extremeLoad);

      const extremeLoadTime = performance.now() - startTime;

      // CRITICAL: Even extreme load should complete within 5 seconds
      expect(extremeLoadTime).toBeLessThan(5000);

      // All operations should have been processed
      expect(mockDb.write).toHaveBeenCalledTimes(operations);

      // Clean up
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });
  });
});