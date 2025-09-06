module.exports = async () => {
  // Global setup for all tests
  console.log('🧪 Setting up global test environment...')
  
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_APP_ENV = 'test'
  
  // Initialize any global test resources
  global.__TEST_START_TIME__ = Date.now()
  
  console.log('✅ Global test setup complete')
}