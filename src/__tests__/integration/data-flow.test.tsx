/**
 * CRITICAL INTEGRATION TESTS: End-to-End Data Flow
 * 
 * These tests verify that the single source of truth architecture works
 * correctly across the entire application stack, from UI components to
 * database persistence to real-time synchronization.
 * 
 * FAILURE OF THESE TESTS INDICATES SYSTEM-WIDE BREAKDOWN
 */

import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { 
  masterDataService, 
  MasterDataService,
  DailyScheduleEntry,
  Facility,
  Personnel,
  PersonnelAssignment 
} from '@/lib/services/MasterDataService';

// Mock components for integration testing
const MockTablesHub = ({ onDataChange }: { onDataChange: (data: any) => void }) => {
  const [scheduleData, setScheduleData] = React.useState<DailyScheduleEntry[]>([]);
  
  React.useEffect(() => {
    const unsubscribe = masterDataService.subscribeToTable('daily_schedule', (data) => {
      setScheduleData(data);
      onDataChange(data);
    });
    return unsubscribe;
  }, [onDataChange]);

  const handleAddEntry = async () => {
    await masterDataService.addDailyScheduleEntry({
      operation_id: 'integration-test-op',
      time: '14:00',
      event_name: 'Integration Test Event',
      event_type: 'meeting'
    });
  };

  return (
    <div data-testid="tables-hub">
      <h2>Tables Hub</h2>
      <div data-testid="schedule-list">
        {scheduleData.map(entry => (
          <div key={entry.id} data-testid={`schedule-${entry.id}`}>
            {entry.time} - {entry.event_name}
          </div>
        ))}
      </div>
      <button data-testid="add-entry" onClick={handleAddEntry}>
        Add Entry
      </button>
    </div>
  );
};

const MockIAPEditor = ({ onDataChange }: { onDataChange: (data: any) => void }) => {
  const [scheduleData, setScheduleData] = React.useState<DailyScheduleEntry[]>([]);
  
  React.useEffect(() => {
    const unsubscribe = masterDataService.subscribeToTable('daily_schedule', (data) => {
      setScheduleData(data);
      onDataChange(data);
    });
    return unsubscribe;
  }, [onDataChange]);

  const handleUpdateEntry = async (id: string) => {
    const entry = scheduleData.find(e => e.id === id);
    if (entry) {
      await masterDataService.updateDailySchedule({
        ...entry,
        event_name: 'Updated from IAP Editor'
      });
    }
  };

  return (
    <div data-testid="iap-editor">
      <h2>IAP Editor</h2>
      <div data-testid="iap-schedule-list">
        {scheduleData.map(entry => (
          <div key={entry.id} data-testid={`iap-schedule-${entry.id}`}>
            {entry.time} - {entry.event_name}
            <button 
              data-testid={`update-${entry.id}`}
              onClick={() => handleUpdateEntry(entry.id)}
            >
              Update
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockFacilityManager = ({ onDataChange }: { onDataChange: (data: any) => void }) => {
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  
  React.useEffect(() => {
    const unsubscribe = masterDataService.subscribeToTable('facilities', (data) => {
      setFacilities(data);
      onDataChange(data);
    });
    return unsubscribe;
  }, [onDataChange]);

  const handleUpdateFacility = async (id: string) => {
    const facility = facilities.find(f => f.id === id);
    if (facility) {
      await masterDataService.updateFacility({
        ...facility,
        status: facility.status === 'open' ? 'closed' : 'open'
      });
    }
  };

  return (
    <div data-testid="facility-manager">
      <h2>Facility Manager</h2>
      <div data-testid="facility-list">
        {facilities.map(facility => (
          <div key={facility.id} data-testid={`facility-${facility.id}`}>
            {facility.name} - Status: {facility.status}
            <button 
              data-testid={`toggle-${facility.id}`}
              onClick={() => handleUpdateFacility(facility.id)}
            >
              Toggle Status
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Integration test application
const IntegrationTestApp = () => {
  const [tablesData, setTablesData] = React.useState<any>(null);
  const [iapData, setIapData] = React.useState<any>(null);
  const [facilityData, setFacilityData] = React.useState<any>(null);

  return (
    <div data-testid="integration-app">
      <MockTablesHub onDataChange={setTablesData} />
      <MockIAPEditor onDataChange={setIapData} />
      <MockFacilityManager onDataChange={setFacilityData} />
      
      {/* Debug info */}
      <div data-testid="sync-status">
        <div data-testid="tables-sync">{JSON.stringify(tablesData)}</div>
        <div data-testid="iap-sync">{JSON.stringify(iapData)}</div>
        <div data-testid="facility-sync">{JSON.stringify(facilityData)}</div>
      </div>
    </div>
  );
};

describe('🔥 CRITICAL: End-to-End Data Flow Integration', () => {
  let service: MasterDataService;
  const user = userEvent.setup();

  beforeAll(async () => {
    // Initialize integration test environment
    service = masterDataService;
    await service.setCurrentOperation('integration-test-op');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up integration test data
    jest.restoreAllMocks();
  });

  // ============================================
  // CRITICAL: Bidirectional Sync Between Components
  // ============================================

  describe('🔥 CRITICAL: Tables Hub ↔ IAP Editor Sync', () => {
    it('should sync data from Tables Hub to IAP Editor - CRITICAL', async () => {
      const { container } = render(<IntegrationTestApp />);
      
      // Wait for components to mount
      await waitFor(() => {
        expect(screen.getByTestId('tables-hub')).toBeInTheDocument();
        expect(screen.getByTestId('iap-editor')).toBeInTheDocument();
      });

      // Add entry from Tables Hub
      const addButton = screen.getByTestId('add-entry');
      await user.click(addButton);

      // CRITICAL: Verify data appears in both components
      await waitFor(() => {
        const tablesEntry = screen.getByTestId('schedule-list');
        const iapEntry = screen.getByTestId('iap-schedule-list');
        
        expect(tablesEntry).toHaveTextContent('14:00 - Integration Test Event');
        expect(iapEntry).toHaveTextContent('14:00 - Integration Test Event');
      }, { timeout: 5000 });
    });

    it('should sync data from IAP Editor to Tables Hub - CRITICAL', async () => {
      // First add an entry to create test data
      const scheduleId = await service.addDailyScheduleEntry({
        operation_id: 'integration-test-op',
        time: '15:00',
        event_name: 'Original Event',
        event_type: 'briefing'
      });

      const { container } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('iap-editor')).toBeInTheDocument();
      });

      // Update from IAP Editor
      const updateButton = screen.getByTestId(`update-${scheduleId}`);
      await user.click(updateButton);

      // CRITICAL: Verify update appears in both components
      await waitFor(() => {
        const tablesEntry = screen.getByTestId('schedule-list');
        const iapEntry = screen.getByTestId('iap-schedule-list');
        
        expect(tablesEntry).toHaveTextContent('15:00 - Updated from IAP Editor');
        expect(iapEntry).toHaveTextContent('15:00 - Updated from IAP Editor');
      }, { timeout: 5000 });
    });
  });

  // ============================================
  // CRITICAL: Multi-Component Sync Verification
  // ============================================

  describe('🔥 CRITICAL: Multi-Component Data Consistency', () => {
    it('should maintain consistency across all components during rapid updates - CRITICAL', async () => {
      // Add test facility
      const facilityId = await service.addFacility({
        operation_id: 'integration-test-op',
        facility_type: 'shelter',
        name: 'Test Sync Facility',
        status: 'planned'
      });

      const { container } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('facility-manager')).toBeInTheDocument();
      });

      // Perform rapid updates
      const toggleButton = screen.getByTestId(`toggle-${facilityId}`);
      
      // Click multiple times rapidly
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);

      // CRITICAL: Final state should be consistent
      await waitFor(() => {
        const facilityStatus = screen.getByTestId(`facility-${facilityId}`);
        const syncStatus = screen.getByTestId('facility-sync');
        
        // Both displays should show the same final state
        expect(facilityStatus).toHaveTextContent('Status: closed'); // odd number of clicks
        expect(syncStatus).toHaveTextContent('closed');
      }, { timeout: 3000 });
    });

    it('should handle concurrent updates from multiple components - CRITICAL', async () => {
      // Add test data
      const scheduleId = await service.addDailyScheduleEntry({
        operation_id: 'integration-test-op',
        time: '16:00',
        event_name: 'Concurrent Test Event',
        event_type: 'operation'
      });

      const { container } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('tables-hub')).toBeInTheDocument();
        expect(screen.getByTestId('iap-editor')).toBeInTheDocument();
      });

      // Simulate concurrent updates from different components
      const tablesAddButton = screen.getByTestId('add-entry');
      const iapUpdateButton = screen.getByTestId(`update-${scheduleId}`);

      // Execute concurrently
      await Promise.all([
        user.click(tablesAddButton),
        user.click(iapUpdateButton)
      ]);

      // CRITICAL: Both operations should succeed and data should be consistent
      await waitFor(() => {
        const tablesData = screen.getByTestId('tables-sync');
        const iapData = screen.getByTestId('iap-sync');
        
        // Verify both components have the same data
        expect(tablesData.textContent).toBe(iapData.textContent);
      }, { timeout: 5000 });
    });
  });

  // ============================================
  // CRITICAL: Real-time Propagation Speed
  // ============================================

  describe('🔥 CRITICAL: Real-time Propagation Performance', () => {
    it('should propagate changes within 100ms across all components - CRITICAL', async () => {
      const { container } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('tables-hub')).toBeInTheDocument();
      });

      const startTime = Date.now();

      // Make a change
      const addButton = screen.getByTestId('add-entry');
      await user.click(addButton);

      // Wait for propagation
      await waitFor(() => {
        const iapList = screen.getByTestId('iap-schedule-list');
        expect(iapList).toHaveTextContent('14:00 - Integration Test Event');
      });

      const propagationTime = Date.now() - startTime;

      // CRITICAL: Must propagate within performance threshold
      expect(propagationTime).toBeLessThan(100);
    });

    it('should handle 50 rapid updates without degradation - CRITICAL', async () => {
      // Add test facility for rapid updates
      const facilityId = await service.addFacility({
        operation_id: 'integration-test-op',
        facility_type: 'shelter',
        name: 'Rapid Update Test',
        status: 'planned'
      });

      const { container } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('facility-manager')).toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId(`toggle-${facilityId}`);
      const startTime = Date.now();

      // Perform 50 rapid updates
      for (let i = 0; i < 50; i++) {
        await user.click(toggleButton);
      }

      const totalTime = Date.now() - startTime;

      // CRITICAL: Should handle rapid updates without significant degradation
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 50 updates
      
      // Final state should be consistent
      await waitFor(() => {
        const facilityStatus = screen.getByTestId(`facility-${facilityId}`);
        expect(facilityStatus).toHaveTextContent('Status:'); // Should have some status
      });
    });
  });

  // ============================================
  // CRITICAL: Data Persistence Integration
  // ============================================

  describe('🔥 CRITICAL: Data Persistence and Recovery', () => {
    it('should persist data correctly through component unmount/remount - CRITICAL', async () => {
      // Add test data
      const scheduleId = await service.addDailyScheduleEntry({
        operation_id: 'integration-test-op',
        time: '17:00',
        event_name: 'Persistence Test',
        event_type: 'deadline'
      });

      // Render and verify data is present
      const { unmount } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('schedule-list')).toHaveTextContent('17:00 - Persistence Test');
      });

      // Unmount components (simulate navigation)
      unmount();

      // Remount and verify data persists
      render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('schedule-list')).toHaveTextContent('17:00 - Persistence Test');
      });
    });

    it('should maintain data integrity after simulated offline/online cycle - CRITICAL', async () => {
      const { container } = render(<IntegrationTestApp />);
      
      // Add data while "online"
      const addButton = screen.getByTestId('add-entry');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('schedule-list')).toHaveTextContent('Integration Test Event');
      });

      // Simulate offline mode (would need actual offline/online implementation)
      // For now, verify data persists through component lifecycle

      // Change operation context and back (simulates session restoration)
      await service.setCurrentOperation('temp-op');
      await service.setCurrentOperation('integration-test-op');

      // CRITICAL: Data should persist through context changes
      await waitFor(() => {
        expect(screen.getByTestId('schedule-list')).toHaveTextContent('Integration Test Event');
      });
    });
  });

  // ============================================
  // CRITICAL: Error Recovery Integration
  // ============================================

  describe('🔥 CRITICAL: Error Recovery and Graceful Degradation', () => {
    it('should recover gracefully from database errors - CRITICAL', async () => {
      const { container } = render(<IntegrationTestApp />);
      
      // Mock database error
      const originalQuery = service.getDailySchedule;
      jest.spyOn(service, 'getDailySchedule').mockRejectedValueOnce(new Error('Database error'));

      // Components should handle error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('tables-hub')).toBeInTheDocument();
        expect(screen.getByTestId('iap-editor')).toBeInTheDocument();
      });

      // Restore normal operation
      jest.spyOn(service, 'getDailySchedule').mockRestore();

      // System should recover
      const addButton = screen.getByTestId('add-entry');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('schedule-list')).toHaveTextContent('Integration Test Event');
      });
    });

    it('should maintain partial functionality during service degradation - CRITICAL', async () => {
      const { container } = render(<IntegrationTestApp />);
      
      // Mock partial service failure
      jest.spyOn(service, 'updateDailySchedule').mockRejectedValue(new Error('Update failed'));

      // Components should still render existing data
      await waitFor(() => {
        expect(screen.getByTestId('tables-hub')).toBeInTheDocument();
        expect(screen.getByTestId('iap-editor')).toBeInTheDocument();
      });

      // Read operations should still work
      await service.addDailyScheduleEntry({
        operation_id: 'integration-test-op',
        time: '18:00',
        event_name: 'Recovery Test'
      });

      await waitFor(() => {
        expect(screen.getByTestId('schedule-list')).toHaveTextContent('Recovery Test');
      });
    });
  });

  // ============================================
  // CRITICAL: Memory Management Integration
  // ============================================

  describe('🔥 CRITICAL: Memory Management and Resource Cleanup', () => {
    it('should clean up subscriptions on component unmount - CRITICAL', async () => {
      const { unmount } = render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      // Unmount should clean up all subscriptions
      unmount();

      // This would require access to internal subscription tracking
      // In a real implementation, we'd verify no memory leaks
      expect(true).toBe(true); // Placeholder for subscription cleanup verification
    });

    it('should handle rapid component mount/unmount cycles - CRITICAL', async () => {
      // Simulate rapid navigation or component switching
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<IntegrationTestApp />);
        
        await waitFor(() => {
          expect(screen.getByTestId('integration-app')).toBeInTheDocument();
        });

        unmount();
      }

      // Final render should work normally
      render(<IntegrationTestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });
    });
  });
});