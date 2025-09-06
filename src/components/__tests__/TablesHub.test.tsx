/**
 * CRITICAL COMPONENT TESTS: TablesHub
 * 
 * These tests verify that the TablesHub component correctly displays data
 * from the MasterDataService and updates in real-time when data changes.
 * 
 * FAILURE OF THESE TESTS INDICATES THE SINGLE SOURCE OF TRUTH IS BROKEN
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TablesHub } from '../TablesHub';

// Mock the master data hooks
jest.mock('@/hooks/useMasterData', () => ({
  useDailySchedule: jest.fn(),
  useFacilities: jest.fn(),
  usePersonnel: jest.fn(),
  useGaps: jest.fn(),
  useWorkAssignments: jest.fn(),
}));

// Mock the MasterDataService
jest.mock('@/lib/services/MasterDataService', () => ({
  initializeMasterDataService: jest.fn(),
}));

import { 
  useDailySchedule, 
  useFacilities, 
  usePersonnel, 
  useGaps, 
  useWorkAssignments 
} from '@/hooks/useMasterData';
import { initializeMasterDataService } from '@/lib/services/MasterDataService';

describe('🔥 CRITICAL: TablesHub Component', () => {
  const user = userEvent.setup();

  // Mock data
  const mockFacilities = [
    {
      id: 'shelter-1',
      name: 'Emergency Shelter Alpha',
      facility_type: 'shelter',
      county: 'Test County',
      address: '123 Test Street',
      status: 'open',
      capacity: { maximum: 100, current: 45 }
    },
    {
      id: 'feeding-1', 
      name: 'Mobile Kitchen Unit 1',
      facility_type: 'feeding',
      county: 'Test County',
      address: '456 Feeding Ave',
      status: 'open',
      capacity: { maximum: 500, current: 200 }
    }
  ];

  const mockPersonnel = [
    {
      id: 'person-1',
      first_name: 'John',
      last_name: 'Smith',
      primary_position: 'Operations Section Chief',
      section: 'command',
      phone: '555-0123',
      email: 'john.smith@redcross.org',
      radio_call_sign: 'OPS-1'
    },
    {
      id: 'person-2',
      first_name: 'Jane',
      last_name: 'Doe', 
      primary_position: 'Shelter Manager',
      section: 'operations',
      phone: '555-0456',
      email: 'jane.doe@redcross.org',
      radio_call_sign: 'SHELTER-1'
    }
  ];

  const mockSchedule = [
    {
      id: 'schedule-1',
      time: '08:00',
      event_name: 'Morning Briefing',
      location: 'Command Post',
      responsible_party: 'Operations Section Chief',
      notes: 'Daily operational status update'
    },
    {
      id: 'schedule-2',
      time: '12:00',
      event_name: 'Lunch Break',
      location: 'All Sites',
      responsible_party: 'All Staff',
      notes: 'Scheduled meal break'
    }
  ];

  const mockGaps = [
    {
      id: 'gap-1',
      facility_id: 'shelter-1',
      gap_type: 'personnel',
      gap_category: 'Shelter Staff',
      quantity_needed: 5,
      quantity_available: 2,
      priority: 'critical',
      status: 'open'
    }
  ];

  const mockWorkAssignments = [
    {
      id: 'work-1',
      facility_id: 'shelter-1',
      assignment_type: 'shelter',
      title: 'Evening Shift Management',
      assigned_to: 'person-2',
      status: 'assigned'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock hook return values
    (useFacilities as jest.Mock).mockReturnValue({
      facilities: mockFacilities,
      loading: false,
      updateFacility: jest.fn(),
      getFacilitiesByType: jest.fn((type) => 
        mockFacilities.filter(f => f.facility_type === type)
      )
    });

    (usePersonnel as jest.Mock).mockReturnValue({
      personnel: mockPersonnel,
      loading: false
    });

    (useDailySchedule as jest.Mock).mockReturnValue({
      schedule: mockSchedule,
      loading: false,
      updateEntry: jest.fn(),
      addEntry: jest.fn(),
      deleteEntry: jest.fn()
    });

    (useGaps as jest.Mock).mockReturnValue({
      gaps: mockGaps,
      loading: false,
      criticalGaps: mockGaps.filter(g => g.priority === 'critical')
    });

    (useWorkAssignments as jest.Mock).mockReturnValue({
      assignments: mockWorkAssignments,
      loading: false,
      getAssignmentsByType: jest.fn((type) => 
        mockWorkAssignments.filter(a => a.assignment_type === type)
      )
    });

    (initializeMasterDataService as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // CRITICAL: Component Rendering and Structure
  // ============================================

  describe('🔥 CRITICAL: Component Structure and Navigation', () => {
    it('should render with correct title and structure - CRITICAL', async () => {
      render(<TablesHub />);

      // Main title should be present
      await expect(screen.getByText('📊 Reference Tables Hub')).toBeVisible();
      await expect(screen.getByText('Central data management system')).toBeVisible();

      // Search functionality should be present
      await expect(screen.getByPlaceholderText('Search tables...')).toBeVisible();

      // Category headers should be present
      await expect(screen.getByText('FACILITIES & LOCATIONS')).toBeVisible();
      await expect(screen.getByText('PERSONNEL & CONTACTS')).toBeVisible();
      await expect(screen.getByText('SCHEDULES & PLANNING')).toBeVisible();
    });

    it('should initialize MasterDataService on mount - CRITICAL', async () => {
      render(<TablesHub />);

      await waitFor(() => {
        expect(initializeMasterDataService).toHaveBeenCalledWith('op-current');
      });
    });

    it('should display table categories with correct counts - CRITICAL', async () => {
      render(<TablesHub />);

      // Shelter facilities count
      await expect(screen.getByText('Sheltering Facilities')).toBeVisible();
      const shelterCount = screen.getByText('1'); // 1 shelter facility
      expect(shelterCount).toBeVisible();

      // Feeding facilities count  
      await expect(screen.getByText('Feeding Facilities')).toBeVisible();
      const feedingCount = screen.getByText('1'); // 1 feeding facility
      expect(feedingCount).toBeVisible();

      // Personnel count
      await expect(screen.getByText('Contact Roster')).toBeVisible();
      const personnelCount = screen.getByText('2'); // 2 personnel
      expect(personnelCount).toBeVisible();
    });
  });

  // ============================================
  // CRITICAL: Real-time Data Display
  // ============================================

  describe('🔥 CRITICAL: Real-time Data Display from Master Database', () => {
    it('should display shelter facilities from master database - CRITICAL', async () => {
      render(<TablesHub />);

      // Default table should be shelter facilities
      await waitFor(() => {
        expect(screen.getByText('Emergency Shelter Alpha')).toBeVisible();
        expect(screen.getByText('Test County')).toBeVisible();
        expect(screen.getByText('123 Test Street')).toBeVisible();
        expect(screen.getByText('100')).toBeVisible(); // capacity
        expect(screen.getByText('45')).toBeVisible(); // current occupancy
      });

      // Status should be displayed with correct styling
      const statusBadge = screen.getByText('open');
      expect(statusBadge).toBeVisible();
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should switch between facility types correctly - CRITICAL', async () => {
      render(<TablesHub />);

      // Switch to feeding facilities
      await user.click(screen.getByText('Feeding Facilities'));

      await waitFor(() => {
        expect(screen.getByText('Mobile Kitchen Unit 1')).toBeVisible();
        expect(screen.getByText('456 Feeding Ave')).toBeVisible();
      });
    });

    it('should display personnel data correctly - CRITICAL', async () => {
      render(<TablesHub />);

      // Switch to personnel roster
      await user.click(screen.getByText('Contact Roster'));

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.getByText('Operations Section Chief')).toBeVisible();
        expect(screen.getByText('555-0123')).toBeVisible();
        expect(screen.getByText('john.smith@redcross.org')).toBeVisible();
        expect(screen.getByText('OPS-1')).toBeVisible();

        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Shelter Manager')).toBeVisible();
        expect(screen.getByText('SHELTER-1')).toBeVisible();
      });
    });

    it('should display daily schedule correctly - CRITICAL', async () => {
      render(<TablesHub />);

      // Switch to daily schedule
      await user.click(screen.getByText('Daily Schedule'));

      await waitFor(() => {
        expect(screen.getByText('08:00')).toBeVisible();
        expect(screen.getByText('Morning Briefing')).toBeVisible();
        expect(screen.getByText('Command Post')).toBeVisible();
        expect(screen.getByText('Daily operational status update')).toBeVisible();

        expect(screen.getByText('12:00')).toBeVisible();
        expect(screen.getByText('Lunch Break')).toBeVisible();
      });
    });

    it('should display gap analysis correctly - CRITICAL', async () => {
      render(<TablesHub />);

      // Switch to personnel gaps
      await user.click(screen.getByText('Personnel Gaps'));

      await waitFor(() => {
        expect(screen.getByText('Emergency Shelter Alpha')).toBeVisible(); // facility name
        expect(screen.getByText('Shelter Staff')).toBeVisible(); // gap category
        expect(screen.getByText('5')).toBeVisible(); // quantity needed
        expect(screen.getByText('2')).toBeVisible(); // available
        expect(screen.getByText('3')).toBeVisible(); // gap (5-2=3)
      });

      // Priority should be displayed with correct styling
      const priorityBadge = screen.getByText('critical');
      expect(priorityBadge).toBeVisible();
      expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  // ============================================
  // CRITICAL: Search and Filter Functionality  
  // ============================================

  describe('🔥 CRITICAL: Search and Filter Functionality', () => {
    it('should filter tables based on search term - CRITICAL', async () => {
      render(<TablesHub />);

      const searchInput = screen.getByPlaceholderText('Search tables...');
      
      // Search for "shelter"
      await user.type(searchInput, 'shelter');

      await waitFor(() => {
        // Should show shelter-related tables
        expect(screen.getByText('Sheltering Facilities')).toBeVisible();
        expect(screen.getByText('Shelter Work Assignments')).toBeVisible();
        
        // Should hide non-shelter tables
        expect(screen.queryByText('Feeding Facilities')).not.toBeVisible();
        expect(screen.queryByText('Contact Roster')).not.toBeVisible();
      });
    });

    it('should clear search and show all tables - CRITICAL', async () => {
      render(<TablesHub />);

      const searchInput = screen.getByPlaceholderText('Search tables...');
      
      // Type and then clear search
      await user.type(searchInput, 'shelter');
      await user.clear(searchInput);

      await waitFor(() => {
        // All tables should be visible again
        expect(screen.getByText('Sheltering Facilities')).toBeVisible();
        expect(screen.getByText('Feeding Facilities')).toBeVisible();
        expect(screen.getByText('Contact Roster')).toBeVisible();
      });
    });
  });

  // ============================================
  // CRITICAL: Loading States and Error Handling
  // ============================================

  describe('🔥 CRITICAL: Loading States and Error Handling', () => {
    it('should display loading states correctly - CRITICAL', async () => {
      // Mock loading state
      (useFacilities as jest.Mock).mockReturnValue({
        facilities: [],
        loading: true,
        updateFacility: jest.fn(),
        getFacilitiesByType: jest.fn(() => [])
      });

      render(<TablesHub />);

      await waitFor(() => {
        expect(screen.getByText('Loading shelter facilities...')).toBeVisible();
      });
    });

    it('should display empty states correctly - CRITICAL', async () => {
      // Mock empty state
      (useFacilities as jest.Mock).mockReturnValue({
        facilities: [],
        loading: false,
        updateFacility: jest.fn(),
        getFacilitiesByType: jest.fn(() => [])
      });

      render(<TablesHub />);

      await waitFor(() => {
        expect(screen.getByText('No shelter facilities found. Click "Edit Table" to add facilities.')).toBeVisible();
      });
    });

    it('should handle personnel loading states - CRITICAL', async () => {
      (usePersonnel as jest.Mock).mockReturnValue({
        personnel: [],
        loading: true
      });

      render(<TablesHub />);

      // Switch to personnel
      await user.click(screen.getByText('Contact Roster'));

      await waitFor(() => {
        expect(screen.getByText('Loading personnel...')).toBeVisible();
      });
    });

    it('should handle schedule loading states - CRITICAL', async () => {
      (useDailySchedule as jest.Mock).mockReturnValue({
        schedule: [],
        loading: true,
        updateEntry: jest.fn(),
        addEntry: jest.fn(),
        deleteEntry: jest.fn()
      });

      render(<TablesHub />);

      // Switch to schedule
      await user.click(screen.getByText('Daily Schedule'));

      await waitFor(() => {
        expect(screen.getByText('Loading daily schedule...')).toBeVisible();
      });
    });
  });

  // ============================================
  // CRITICAL: Action Buttons and Functionality
  // ============================================

  describe('🔥 CRITICAL: Action Buttons and Edit Mode', () => {
    it('should toggle edit mode correctly - CRITICAL', async () => {
      render(<TablesHub />);

      const editButton = screen.getByText('✏️ Edit Table');
      await user.click(editButton);

      // Should show edit mode notice
      await waitFor(() => {
        expect(screen.getByText('📝 Edit Mode Active:')).toBeVisible();
      });

      // Button text should change
      await waitFor(() => {
        expect(screen.getByText('💾 Save Changes')).toBeVisible();
      });
    });

    it('should show import/export buttons for supported tables - CRITICAL', async () => {
      render(<TablesHub />);

      // Should show import and export buttons for shelter facilities
      await waitFor(() => {
        expect(screen.getByText('📥 Import CSV')).toBeVisible();
        expect(screen.getByText('📤 Export CSV')).toBeVisible();
      });
    });

    it('should handle CSV import button click - CRITICAL', async () => {
      render(<TablesHub />);

      const importButton = screen.getByText('📥 Import CSV');
      await user.click(importButton);

      // Should trigger file input (tested by checking button exists and is clickable)
      expect(importButton).toBeEnabled();
    });

    it('should handle CSV export button click - CRITICAL', async () => {
      // Mock alert to capture export attempt
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<TablesHub />);

      const exportButton = screen.getByText('📤 Export CSV');
      await user.click(exportButton);

      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Export feature for Sheltering Facilities coming soon!')
      );

      alertSpy.mockRestore();
    });
  });

  // ============================================
  // CRITICAL: Data Count Accuracy
  // ============================================

  describe('🔥 CRITICAL: Data Count Accuracy and Consistency', () => {
    it('should display accurate record counts - CRITICAL', async () => {
      render(<TablesHub />);

      // Check record count in table header
      await waitFor(() => {
        expect(screen.getByText('1 records')).toBeVisible(); // 1 shelter facility
      });

      // Switch to personnel and check count
      await user.click(screen.getByText('Contact Roster'));
      
      await waitFor(() => {
        expect(screen.getByText('2 records')).toBeVisible(); // 2 personnel
      });
    });

    it('should update counts when data changes - CRITICAL', async () => {
      const { rerender } = render(<TablesHub />);

      // Initial count should be 1
      await waitFor(() => {
        expect(screen.getByText('1 records')).toBeVisible();
      });

      // Mock updated data with more facilities
      (useFacilities as jest.Mock).mockReturnValue({
        facilities: [...mockFacilities, {
          id: 'shelter-2',
          name: 'Emergency Shelter Beta', 
          facility_type: 'shelter',
          county: 'Test County',
          status: 'planned'
        }],
        loading: false,
        updateFacility: jest.fn(),
        getFacilitiesByType: jest.fn((type) => 
          [...mockFacilities, { id: 'shelter-2', facility_type: 'shelter' }]
            .filter(f => f.facility_type === type)
        )
      });

      rerender(<TablesHub />);

      // Count should update to 2
      await waitFor(() => {
        expect(screen.getByText('2 records')).toBeVisible();
      });
    });
  });

  // ============================================
  // CRITICAL: Table Footer Information
  // ============================================

  describe('🔥 CRITICAL: Table Footer and Metadata', () => {
    it('should display correct sync status and metadata - CRITICAL', async () => {
      render(<TablesHub />);

      await waitFor(() => {
        expect(screen.getByText('Data Source:')).toBeVisible();
        expect(screen.getByText('Local Database')).toBeVisible();
        expect(screen.getByText('Sync Status:')).toBeVisible();
        expect(screen.getByText('✓ Synced')).toBeVisible();
      });
    });

    it('should display last updated timestamp - CRITICAL', async () => {
      render(<TablesHub />);

      await waitFor(() => {
        expect(screen.getByText('Last Updated:')).toBeVisible();
        // Should have some timestamp (exact time will vary)
        const timestampElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(timestampElement).toBeVisible();
      });
    });
  });
});