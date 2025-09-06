/**
 * CRITICAL END-TO-END TESTS: Mission-Critical User Flows
 * 
 * These tests verify the most critical user journeys that MUST work
 * during actual disaster response operations. Failure of these tests
 * indicates the system is not suitable for life-safety operations.
 * 
 * EVERY TEST HERE REPRESENTS A CRITICAL CAPABILITY
 */

import { test, expect, Page } from '@playwright/test';

// Test data setup
const TEST_OPERATION = {
  id: 'hurricane-response-2025',
  name: 'Hurricane Test Response 2025',
  type: 'emergency',
  status: 'active'
};

const TEST_FACILITY = {
  name: 'Emergency Shelter Alpha',
  type: 'shelter',
  capacity: 150,
  address: '123 Test Street, Test City, FL 12345'
};

const TEST_PERSONNEL = {
  firstName: 'John',
  lastName: 'Smith', 
  email: 'john.smith@redcross.org',
  position: 'Operations Section Chief'
};

test.describe('🔥 CRITICAL: Mission-Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('/');
    await expect(page).toHaveTitle(/Disaster Operations/);
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
  });

  // ============================================
  // CRITICAL TEST: Complete IAP Generation
  // ============================================
  
  test('🔥 CRITICAL: Complete IAP generation workflow', async ({ page }) => {
    // STEP 1: Create new operation
    await test.step('Create emergency operation', async () => {
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', TEST_OPERATION.name);
      await page.selectOption('[data-testid="operation-type"]', TEST_OPERATION.type);
      await page.click('[data-testid="create-operation"]');
      
      await expect(page.locator('[data-testid="operation-created"]')).toBeVisible();
    });

    // STEP 2: Add facilities
    await test.step('Add emergency facilities', async () => {
      await page.click('[data-testid="facility-manager"]');
      await page.click('[data-testid="add-facility"]');
      
      await page.fill('[data-testid="facility-name"]', TEST_FACILITY.name);
      await page.selectOption('[data-testid="facility-type"]', TEST_FACILITY.type);
      await page.fill('[data-testid="facility-capacity"]', TEST_FACILITY.capacity.toString());
      await page.fill('[data-testid="facility-address"]', TEST_FACILITY.address);
      
      await page.click('[data-testid="save-facility"]');
      await expect(page.locator(`text=${TEST_FACILITY.name}`)).toBeVisible();
    });

    // STEP 3: Assign personnel
    await test.step('Assign key personnel', async () => {
      await page.click('[data-testid="personnel-manager"]');
      await page.click('[data-testid="add-personnel"]');
      
      await page.fill('[data-testid="first-name"]', TEST_PERSONNEL.firstName);
      await page.fill('[data-testid="last-name"]', TEST_PERSONNEL.lastName);
      await page.fill('[data-testid="email"]', TEST_PERSONNEL.email);
      await page.fill('[data-testid="position"]', TEST_PERSONNEL.position);
      
      await page.click('[data-testid="save-personnel"]');
      await expect(page.locator(`text=${TEST_PERSONNEL.firstName} ${TEST_PERSONNEL.lastName}`)).toBeVisible();
    });

    // STEP 4: Create daily schedule
    await test.step('Create operational schedule', async () => {
      await page.click('[data-testid="daily-schedule"]');
      await page.click('[data-testid="add-schedule-entry"]');
      
      await page.fill('[data-testid="schedule-time"]', '08:00');
      await page.fill('[data-testid="schedule-activity"]', 'Morning Operations Briefing');
      await page.selectOption('[data-testid="schedule-type"]', 'briefing');
      await page.fill('[data-testid="responsible-party"]', TEST_PERSONNEL.position);
      
      await page.click('[data-testid="save-schedule-entry"]');
      await expect(page.locator('text=Morning Operations Briefing')).toBeVisible();
    });

    // STEP 5: Generate complete IAP
    await test.step('Generate complete IAP document', async () => {
      await page.click('[data-testid="iap-generator"]');
      await page.click('[data-testid="generate-full-iap"]');
      
      // Wait for IAP generation (this may take time)
      await page.waitForSelector('[data-testid="iap-generated"]', { timeout: 30000 });
      
      // Verify all 53 pages are generated
      const pageCount = await page.locator('[data-testid="iap-page-count"]').textContent();
      expect(pageCount).toBe('53');
      
      // Verify critical sections exist
      await expect(page.locator('[data-testid="iap-cover-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="iap-org-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="iap-daily-schedule"]')).toBeVisible();
      await expect(page.locator('[data-testid="iap-facilities-list"]')).toBeVisible();
    });

    // STEP 6: Verify IAP data consistency
    await test.step('Verify IAP contains correct data', async () => {
      // Check that facility appears in IAP
      await page.click('[data-testid="iap-facilities-section"]');
      await expect(page.locator(`text=${TEST_FACILITY.name}`)).toBeVisible();
      
      // Check that personnel appears in org chart
      await page.click('[data-testid="iap-org-chart"]');
      await expect(page.locator(`text=${TEST_PERSONNEL.firstName} ${TEST_PERSONNEL.lastName}`)).toBeVisible();
      
      // Check that schedule appears correctly
      await page.click('[data-testid="iap-schedule-section"]');
      await expect(page.locator('text=Morning Operations Briefing')).toBeVisible();
      await expect(page.locator('text=08:00')).toBeVisible();
    });
  });

  // ============================================
  // CRITICAL TEST: Bidirectional Data Sync
  // ============================================

  test('🔥 CRITICAL: Bidirectional data synchronization', async ({ page }) => {
    await test.step('Setup test operation', async () => {
      // Create operation and add initial data
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', 'Sync Test Operation');
      await page.click('[data-testid="create-operation"]');
      await expect(page.locator('[data-testid="operation-created"]')).toBeVisible();
    });

    await test.step('Add schedule entry in IAP Editor', async () => {
      await page.click('[data-testid="iap-editor"]');
      await page.click('[data-testid="daily-schedule-tab"]');
      await page.click('[data-testid="add-schedule-entry"]');
      
      await page.fill('[data-testid="schedule-time"]', '09:00');
      await page.fill('[data-testid="schedule-activity"]', 'Test Sync Activity');
      await page.click('[data-testid="save-entry"]');
      
      await expect(page.locator('text=Test Sync Activity')).toBeVisible();
    });

    await test.step('Verify entry appears in Tables Hub', async () => {
      await page.click('[data-testid="tables-hub"]');
      await page.click('[data-testid="daily-schedule-table"]');
      
      // CRITICAL: Entry must appear in Tables Hub immediately
      await expect(page.locator('text=Test Sync Activity')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=09:00')).toBeVisible();
    });

    await test.step('Edit entry in Tables Hub', async () => {
      await page.click('[data-testid="edit-schedule-entry"]');
      await page.fill('[data-testid="schedule-activity-input"]', 'Updated Sync Activity');
      await page.click('[data-testid="save-changes"]');
      
      await expect(page.locator('text=Updated Sync Activity')).toBeVisible();
    });

    await test.step('Verify update appears in IAP Editor', async () => {
      await page.click('[data-testid="iap-editor"]');
      await page.click('[data-testid="daily-schedule-tab"]');
      
      // CRITICAL: Update must propagate back to IAP Editor
      await expect(page.locator('text=Updated Sync Activity')).toBeVisible({ timeout: 2000 });
    });

    await test.step('Verify update appears in Facility Manager', async () => {
      await page.click('[data-testid="facility-manager"]');
      
      // If schedule is linked to facilities, it should appear there too
      // This tests the comprehensive data propagation
      const scheduleInFacilityView = page.locator('[data-testid="facility-schedule"]');
      if (await scheduleInFacilityView.isVisible()) {
        await expect(scheduleInFacilityView.locator('text=Updated Sync Activity')).toBeVisible();
      }
    });
  });

  // ============================================
  // CRITICAL TEST: Facility Management
  // ============================================

  test('🔥 CRITICAL: Facility management across all views', async ({ page }) => {
    await test.step('Create operation and add facility', async () => {
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', 'Facility Test Operation');
      await page.click('[data-testid="create-operation"]');
      
      await page.click('[data-testid="facility-manager"]');
      await page.click('[data-testid="add-facility"]');
      
      await page.fill('[data-testid="facility-name"]', 'Test Shelter Beta');
      await page.selectOption('[data-testid="facility-type"]', 'shelter');
      await page.fill('[data-testid="facility-capacity"]', '200');
      await page.click('[data-testid="save-facility"]');
      
      await expect(page.locator('text=Test Shelter Beta')).toBeVisible();
    });

    await test.step('Update facility status', async () => {
      await page.click('[data-testid="facility-status-dropdown"]');
      await page.selectOption('[data-testid="facility-status-dropdown"]', 'open');
      await page.click('[data-testid="update-facility-status"]');
      
      await expect(page.locator('[data-testid="facility-status"]')).toContainText('open');
    });

    await test.step('Verify facility appears in Tables Hub', async () => {
      await page.click('[data-testid="tables-hub"]');
      await page.click('[data-testid="facilities-table"]');
      
      await expect(page.locator('text=Test Shelter Beta')).toBeVisible();
      await expect(page.locator('text=open')).toBeVisible();
    });

    await test.step('Verify facility appears in IAP', async () => {
      await page.click('[data-testid="iap-editor"]');
      await page.click('[data-testid="facilities-section"]');
      
      await expect(page.locator('text=Test Shelter Beta')).toBeVisible();
      await expect(page.locator('text=Capacity: 200')).toBeVisible();
    });

    await test.step('Update facility from Tables Hub', async () => {
      await page.click('[data-testid="tables-hub"]');
      await page.click('[data-testid="facilities-table"]');
      await page.click('[data-testid="edit-facility"]');
      
      await page.fill('[data-testid="current-occupancy"]', '75');
      await page.click('[data-testid="save-changes"]');
      
      await expect(page.locator('text=75')).toBeVisible();
    });

    await test.step('Verify occupancy update propagates everywhere', async () => {
      // Check Facility Manager
      await page.click('[data-testid="facility-manager"]');
      await expect(page.locator('[data-testid="current-occupancy"]')).toContainText('75');
      
      // Check IAP Editor
      await page.click('[data-testid="iap-editor"]');
      await page.click('[data-testid="facilities-section"]');
      await expect(page.locator('text=Current: 75')).toBeVisible();
      
      // Check available capacity calculation
      await expect(page.locator('text=Available: 125')).toBeVisible(); // 200 - 75 = 125
    });
  });

  // ============================================
  // CRITICAL TEST: Personnel and Work Assignments
  // ============================================

  test('🔥 CRITICAL: Personnel assignment workflow', async ({ page }) => {
    await test.step('Create operation with personnel', async () => {
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', 'Personnel Test Operation');
      await page.click('[data-testid="create-operation"]');
      
      // Add personnel
      await page.click('[data-testid="personnel-manager"]');
      await page.click('[data-testid="add-personnel"]');
      
      await page.fill('[data-testid="first-name"]', 'Jane');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="position"]', 'Shelter Manager');
      await page.click('[data-testid="save-personnel"]');
    });

    await test.step('Create work assignment', async () => {
      await page.click('[data-testid="work-assignments"]');
      await page.click('[data-testid="create-assignment"]');
      
      await page.fill('[data-testid="assignment-title"]', 'Manage Evening Shelter Operations');
      await page.selectOption('[data-testid="assignment-priority"]', 'high');
      await page.selectOption('[data-testid="assigned-to"]', 'Jane Doe');
      await page.fill('[data-testid="due-date"]', '2025-09-07');
      
      await page.click('[data-testid="save-assignment"]');
      await expect(page.locator('text=Manage Evening Shelter Operations')).toBeVisible();
    });

    await test.step('Verify assignment appears in personnel view', async () => {
      await page.click('[data-testid="personnel-manager"]');
      await page.click('[data-testid="view-personnel-jane-doe"]');
      
      await expect(page.locator('text=Manage Evening Shelter Operations')).toBeVisible();
      await expect(page.locator('[data-testid="assignment-status"]')).toContainText('assigned');
    });

    await test.step('Update assignment status', async () => {
      await page.click('[data-testid="work-assignments"]');
      await page.click('[data-testid="edit-assignment"]');
      await page.selectOption('[data-testid="assignment-status"]', 'in-progress');
      await page.click('[data-testid="save-changes"]');
      
      await expect(page.locator('[data-testid="status-badge"]')).toContainText('in-progress');
    });

    await test.step('Verify status update in personnel view', async () => {
      await page.click('[data-testid="personnel-manager"]');
      await page.click('[data-testid="view-personnel-jane-doe"]');
      
      await expect(page.locator('[data-testid="assignment-status"]')).toContainText('in-progress');
    });
  });

  // ============================================
  // CRITICAL TEST: Real-time Gap Analysis
  // ============================================

  test('🔥 CRITICAL: Real-time gap analysis updates', async ({ page }) => {
    await test.step('Create operation and identify gap', async () => {
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', 'Gap Analysis Test');
      await page.click('[data-testid="create-operation"]');
      
      await page.click('[data-testid="gap-analysis"]');
      await page.click('[data-testid="identify-gap"]');
      
      await page.selectOption('[data-testid="gap-type"]', 'personnel');
      await page.fill('[data-testid="gap-description"]', 'Need 5 additional shelter staff');
      await page.fill('[data-testid="quantity-needed"]', '5');
      await page.selectOption('[data-testid="gap-priority"]', 'critical');
      
      await page.click('[data-testid="save-gap"]');
      await expect(page.locator('text=Need 5 additional shelter staff')).toBeVisible();
    });

    await test.step('Fill partial gap', async () => {
      await page.click('[data-testid="edit-gap"]');
      await page.fill('[data-testid="quantity-available"]', '2');
      await page.click('[data-testid="save-changes"]');
      
      // Verify gap status updates
      await expect(page.locator('[data-testid="gap-remaining"]')).toContainText('3'); // 5 - 2 = 3
      await expect(page.locator('[data-testid="gap-status"]')).toContainText('partially-filled');
    });

    await test.step('Verify gap appears in dashboard', async () => {
      await page.click('[data-testid="operations-dashboard"]');
      
      await expect(page.locator('[data-testid="critical-gaps"]')).toContainText('Need 5 additional shelter staff');
      await expect(page.locator('[data-testid="gap-progress"]')).toContainText('2/5'); // 2 out of 5 filled
    });

    await test.step('Complete gap filling', async () => {
      await page.click('[data-testid="gap-analysis"]');
      await page.click('[data-testid="edit-gap"]');
      await page.fill('[data-testid="quantity-available"]', '5');
      await page.selectOption('[data-testid="gap-status"]', 'filled');
      await page.click('[data-testid="save-changes"]');
      
      await expect(page.locator('[data-testid="gap-status"]')).toContainText('filled');
    });

    await test.step('Verify gap completion in dashboard', async () => {
      await page.click('[data-testid="operations-dashboard"]');
      
      // Critical gap should no longer appear in active gaps
      await expect(page.locator('[data-testid="active-critical-gaps"]')).not.toContainText('Need 5 additional shelter staff');
      
      // But should appear in resolved gaps
      await expect(page.locator('[data-testid="resolved-gaps"]')).toContainText('Need 5 additional shelter staff');
    });
  });

  // ============================================
  // CRITICAL TEST: Offline/Online Transitions
  // ============================================

  test('🔥 CRITICAL: Offline mode and data synchronization', async ({ page }) => {
    await test.step('Create data while online', async () => {
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', 'Offline Test Operation');
      await page.click('[data-testid="create-operation"]');
      
      await page.click('[data-testid="daily-schedule"]');
      await page.click('[data-testid="add-schedule-entry"]');
      await page.fill('[data-testid="schedule-time"]', '10:00');
      await page.fill('[data-testid="schedule-activity"]', 'Online Created Activity');
      await page.click('[data-testid="save-entry"]');
    });

    await test.step('Simulate offline mode', async () => {
      // Simulate network going offline
      await page.context().setOffline(true);
      
      // Verify offline indicator appears
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Make changes while offline
      await page.click('[data-testid="add-schedule-entry"]');
      await page.fill('[data-testid="schedule-time"]', '11:00');
      await page.fill('[data-testid="schedule-activity"]', 'Offline Created Activity');
      await page.click('[data-testid="save-entry"]');
      
      // Data should be saved locally
      await expect(page.locator('text=Offline Created Activity')).toBeVisible();
      await expect(page.locator('[data-testid="pending-sync-indicator"]')).toBeVisible();
    });

    await test.step('Return to online mode and verify sync', async () => {
      // Restore network connection
      await page.context().setOffline(false);
      
      // Wait for sync to complete
      await expect(page.locator('[data-testid="sync-complete-indicator"]')).toBeVisible({ timeout: 10000 });
      
      // Verify offline-created data is still present
      await expect(page.locator('text=Offline Created Activity')).toBeVisible();
      
      // Verify online-created data is still present
      await expect(page.locator('text=Online Created Activity')).toBeVisible();
      
      // Verify no duplicate entries exist
      const activityCount = await page.locator('[data-testid="schedule-entry"]').count();
      expect(activityCount).toBe(2); // Should have exactly 2 entries
    });
  });

  // ============================================
  // CRITICAL TEST: Performance Under Load
  // ============================================

  test('🔥 CRITICAL: Performance with large datasets', async ({ page }) => {
    test.setTimeout(60000); // Extended timeout for performance test
    
    await test.step('Create operation with large dataset', async () => {
      await page.click('[data-testid="new-operation"]');
      await page.fill('[data-testid="operation-name"]', 'Large Dataset Test');
      await page.click('[data-testid="create-operation"]');
      
      // Create 50 facilities rapidly
      for (let i = 1; i <= 50; i++) {
        await page.click('[data-testid="facility-manager"]');
        await page.click('[data-testid="add-facility"]');
        await page.fill('[data-testid="facility-name"]', `Test Facility ${i}`);
        await page.selectOption('[data-testid="facility-type"]', 'shelter');
        await page.click('[data-testid="save-facility"]');
        
        // Don't wait between creations - test rapid operations
      }
    });

    await test.step('Verify data loads quickly in Tables Hub', async () => {
      const startTime = Date.now();
      
      await page.click('[data-testid="tables-hub"]');
      await page.click('[data-testid="facilities-table"]');
      
      // All 50 facilities should load within 5 seconds
      await expect(page.locator('[data-testid="facility-row"]').first()).toBeVisible({ timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
      
      // Verify all facilities are present
      const facilityCount = await page.locator('[data-testid="facility-row"]').count();
      expect(facilityCount).toBe(50);
    });

    await test.step('Verify IAP generation with large dataset', async () => {
      const startTime = Date.now();
      
      await page.click('[data-testid="iap-generator"]');
      await page.click('[data-testid="generate-full-iap"]');
      
      // IAP should generate within 30 seconds even with 50 facilities
      await expect(page.locator('[data-testid="iap-generated"]')).toBeVisible({ timeout: 30000 });
      
      const generationTime = Date.now() - startTime;
      expect(generationTime).toBeLessThan(30000);
      
      // Verify all facilities appear in IAP
      await page.click('[data-testid="iap-facilities-section"]');
      const iapFacilityCount = await page.locator('[data-testid="iap-facility-entry"]').count();
      expect(iapFacilityCount).toBe(50);
    });
  });
});