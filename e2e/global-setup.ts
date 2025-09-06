import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Setting up Playwright E2E tests...');
  
  // Start the development server if not already running
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  // Wait for the server to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let retries = 0;
  const maxRetries = 30;
  
  while (retries < maxRetries) {
    try {
      console.log(`🔄 Checking server availability (attempt ${retries + 1}/${maxRetries})...`);
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 5000 });
      console.log('✅ Development server is ready');
      break;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('❌ Development server failed to start');
        throw new Error(`Development server is not responding at ${baseURL}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  await browser.close();
  
  // Set up test data if needed
  console.log('📊 Setting up test data...');
  
  // Initialize test database state
  await setupTestData();
  
  console.log('🎭 Playwright setup complete');
}

async function setupTestData() {
  // Initialize any test data needed for E2E tests
  // This could include setting up test operations, facilities, personnel, etc.
  
  // For now, we'll set up some basic test data in localStorage
  const testData = {
    operations: [
      {
        id: 'test-operation-1',
        name: 'Hurricane Test Response',
        status: 'active',
        startDate: new Date().toISOString(),
        facilities: ['shelter-1', 'shelter-2'],
        personnel: ['person-1', 'person-2'],
      }
    ],
    facilities: [
      {
        id: 'shelter-1',
        name: 'Test Emergency Shelter',
        type: 'shelter',
        capacity: 100,
        currentOccupancy: 0,
        status: 'active',
      },
      {
        id: 'shelter-2',
        name: 'Test Backup Shelter',
        type: 'shelter',
        capacity: 50,
        currentOccupancy: 0,
        status: 'standby',
      }
    ],
    personnel: [
      {
        id: 'person-1',
        name: 'Test Operations Chief',
        role: 'Operations Section Chief',
        status: 'active',
      },
      {
        id: 'person-2',
        name: 'Test Shelter Manager',
        role: 'Shelter Manager',
        status: 'active',
      }
    ],
    dailySchedule: [
      {
        id: 'schedule-1',
        time: '08:00',
        activity: 'Morning Briefing',
        responsible: 'person-1',
      },
      {
        id: 'schedule-2',
        time: '12:00',
        activity: 'Lunch Break',
        responsible: 'All Staff',
      }
    ]
  };
  
  // This test data will be available in E2E tests
  global.__TEST_DATA__ = testData;
}

export default globalSetup;