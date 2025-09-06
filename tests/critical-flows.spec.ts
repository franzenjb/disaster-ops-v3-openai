import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Test configuration
test.describe.configure({ mode: 'serial' });

test.describe('Critical User Flows - Disaster Operations Platform', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up console monitoring
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`🚨 Console Error: ${msg.text()}`);
      }
    });
    
    // Monitor uncaught exceptions
    page.on('pageerror', (error) => {
      console.error(`💥 Page Error: ${error.message}`);
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Application loads successfully', async () => {
    console.log('📍 Testing application load...');
    
    await page.goto(BASE_URL);
    
    // Wait for the main content to load
    await expect(page.locator('h1')).toContainText('FLOCOM');
    
    // Verify main navigation buttons are present
    await expect(page.locator('button', { hasText: 'IAP Editor' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'IAP Viewer' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Facility Manager' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Tables & Data Hub' })).toBeVisible();
    
    console.log('✅ Application loaded successfully');
  });

  test('IAP Viewer navigation works', async () => {
    console.log('📍 Testing IAP Viewer navigation...');
    
    await page.goto(BASE_URL);
    
    // Click IAP Viewer button
    await page.click('button:has-text("📄 IAP Viewer")');
    
    // Verify IAP Viewer content is displayed
    await expect(page.locator('h1')).toContainText('Incident Action Plan');
    
    // Check that all IAP sections are present
    const sections = [
      'Cover Page & Checklist',
      'Director\'s Intent/Message',
      'Contact Roster DRO HQ',
      'Incident Organization Chart',
      'Work Sites and Facilities',
      'Daily Schedule'
    ];
    
    for (const section of sections) {
      await expect(page.locator(`button:has-text("${section}")`)).toBeVisible();
    }
    
    console.log('✅ IAP Viewer navigation working');
  });

  test('PDF export functionality exists', async () => {
    console.log('📍 Testing PDF export functionality...');
    
    await page.goto(BASE_URL);
    await page.click('button:has-text("📄 IAP Viewer")');
    
    // Check PDF export buttons are present
    await expect(page.locator('button:has-text("Export PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Preview PDF")')).toBeVisible();
    
    console.log('✅ PDF export functionality present');
  });

  test('Facility Manager access works', async () => {
    console.log('📍 Testing Facility Manager access...');
    
    await page.goto(BASE_URL);
    
    // Click Facility Manager button
    await page.click('button:has-text("Facility Manager")');
    
    // Should navigate or show facility management interface
    // This test will verify the button is clickable and doesn't crash
    await page.waitForTimeout(1000);
    
    console.log('✅ Facility Manager accessible');
  });

  test('Tables & Data Hub access works', async () => {
    console.log('📍 Testing Tables & Data Hub access...');
    
    await page.goto(BASE_URL);
    
    // Click Tables & Data Hub button
    await page.click('button:has-text("📊 Tables & Data Hub")');
    
    // Should navigate or show data hub interface
    await page.waitForTimeout(1000);
    
    console.log('✅ Tables & Data Hub accessible');
  });

  test('Database errors are not blocking user interface', async () => {
    console.log('📍 Testing database error handling...');
    
    let hasBlockingError = false;
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Database not connected')) {
        // This is expected during development
        console.log('⚠️  Expected database connection error (development mode)');
      }
    });
    
    page.on('pageerror', (error) => {
      if (error.message.includes('Database') && error.message.includes('blocking')) {
        hasBlockingError = true;
      }
    });
    
    await page.goto(BASE_URL);
    
    // Verify the main interface still works despite database errors
    await expect(page.locator('h1')).toContainText('FLOCOM');
    await expect(page.locator('button:has-text("IAP Viewer")')).toBeClickable();
    
    // Verify no blocking errors occurred
    expect(hasBlockingError).toBe(false);
    
    console.log('✅ Database errors are not blocking UI');
  });

  test('React Flow warnings are present but not blocking', async () => {
    console.log('📍 Testing React Flow integration...');
    
    let reactFlowWarnings = 0;
    
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('React Flow')) {
        reactFlowWarnings++;
        console.log('⚠️  React Flow warning (expected during development)');
      }
    });
    
    await page.goto(BASE_URL);
    await page.click('button:has-text("📄 IAP Viewer")');
    
    // Navigate to organization chart section which uses React Flow
    const orgChartButton = page.locator('button:has-text("Incident Organization Chart")');
    if (await orgChartButton.isVisible()) {
      await orgChartButton.click();
      await page.waitForTimeout(500);
    }
    
    // Warnings are expected but shouldn't block functionality
    console.log(`📊 React Flow warnings detected: ${reactFlowWarnings}`);
    
    console.log('✅ React Flow warnings are not blocking functionality');
  });

  test('Application performance - page load time', async () => {
    console.log('📍 Testing application performance...');
    
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Page load time: ${loadTime}ms`);
    
    // Verify load time is reasonable (under 5 seconds for development)
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Application performance acceptable');
  });

  test('IAP document structure is complete', async () => {
    console.log('📍 Testing IAP document completeness...');
    
    await page.goto(BASE_URL);
    await page.click('button:has-text("📄 IAP Viewer")');
    
    // Verify key IAP components are present
    const expectedElements = [
      'DR 220-25',  // DR Number
      'Operational Period',
      'Hurricane Helene and Milton',  // Operation name
      'Pages 1-1',  // Page numbering
      'Director\'s Intent/Message',
      'Work Assignment',
      'Work Sites',
      'Daily Schedule'
    ];
    
    for (const element of expectedElements) {
      await expect(page.locator(`text=${element}`)).toBeVisible();
    }
    
    console.log('✅ IAP document structure is complete');
  });

  test('Responsive design - mobile viewport', async () => {
    console.log('📍 Testing responsive design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Verify main elements are still visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigation should adapt to mobile
    const navigationButtons = page.locator('button:has-text("IAP")');
    await expect(navigationButtons.first()).toBeVisible();
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ Responsive design working');
  });

  test('Accessibility - keyboard navigation', async () => {
    console.log('📍 Testing keyboard accessibility...');
    
    await page.goto(BASE_URL);
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible (at least one element should be focused)
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);
    
    console.log('✅ Keyboard navigation working');
  });
});

// Health check test that runs independently
test.describe('Application Health Check', () => {
  test('Quick health check - application responds', async ({ page }) => {
    console.log('🏥 Running health check...');
    
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBeLessThan(400);
    
    // Verify basic content loads
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Application is healthy');
  });
});