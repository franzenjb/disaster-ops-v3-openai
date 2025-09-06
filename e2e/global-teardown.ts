import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up Playwright E2E tests...');
  
  // Clean up test data
  console.log('📊 Cleaning up test data...');
  
  // Clear any test data from global state
  if ((global as any).__TEST_DATA__) {
    delete (global as any).__TEST_DATA__;
  }
  
  // Clean up any test files or temporary resources
  await cleanupTestResources();
  
  console.log('🎭 Playwright teardown complete');
}

async function cleanupTestResources() {
  // Clean up any temporary files, screenshots, or other test artifacts
  // This could include clearing test database records, removing uploaded files, etc.
  
  console.log('🗑️ Test resources cleaned up');
}

export default globalTeardown;