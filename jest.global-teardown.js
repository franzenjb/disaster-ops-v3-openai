module.exports = async () => {
  // Global teardown for all tests
  console.log('🧹 Cleaning up global test environment...')
  
  // Calculate total test time
  const totalTime = Date.now() - global.__TEST_START_TIME__
  console.log(`⏱️ Total test execution time: ${totalTime}ms`)
  
  // Clean up any global test resources
  delete global.__TEST_START_TIME__
  
  console.log('✅ Global test cleanup complete')
}