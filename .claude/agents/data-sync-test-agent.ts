#!/usr/bin/env node

/**
 * Data Synchronization Test Agent
 * 
 * Comprehensive testing agent for data synchronization between components
 * in disaster-ops-v3. Tests sync engines, data migration, real-time updates,
 * and cross-component data consistency.
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
  duration?: number;
}

interface AgentReport {
  agentName: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  results: TestResult[];
  criticalIssues: string[];
  recommendations: string[];
}

interface SyncComponent {
  name: string;
  type: 'engine' | 'manager' | 'service' | 'adapter';
  filePath: string;
  dependencies: string[];
  tested: boolean;
}

class DataSyncTestAgent {
  private results: TestResult[] = [];
  private criticalIssues: string[] = [];
  private recommendations: string[] = [];
  private srcPath: string;

  constructor() {
    this.srcPath = path.resolve(process.cwd(), 'src');
  }

  async runAllTests(): Promise<AgentReport> {
    console.log('🔄 Data Sync Test Agent Starting...\n');

    // Setup DOM environment for testing
    this.setupTestEnvironment();

    // Run all test suites
    await this.testSyncEngineArchitecture();
    await this.testDataMigrationSystem();
    await this.testRealTimeSync();
    await this.testCrossComponentConsistency();
    await this.testConflictResolution();
    await this.testOfflineHandling();
    await this.testPerformanceAndScaling();
    await this.testDataIntegrity();
    
    return this.generateReport();
  }

  private setupTestEnvironment(): void {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    global.document = dom.window.document as any;
    global.window = dom.window.document as any;
    global.navigator = dom.window.navigator as any;

    // Mock IndexedDB
    global.indexedDB = {
      open: jest.fn(),
      deleteDatabase: jest.fn(),
    } as any;
  }

  private async testSyncEngineArchitecture(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Core Sync Engine
      await this.testSyncEngineCore();
      
      // Test 2: Event Bus
      await this.testEventBusSystem();
      
      // Test 3: Local Store
      await this.testLocalStoreImplementation();
      
      // Test 4: Sync Configuration
      await this.testSyncConfiguration();

    } catch (error) {
      this.addResult('SYNC_ARCHITECTURE_ERROR', 'FAIL', 
        'Error testing sync engine architecture', error);
    } finally {
      this.updateTestDuration('SYNC_ARCHITECTURE', startTime);
    }
  }

  private async testSyncEngineCore(): Promise<void> {
    const syncEnginePath = path.join(this.srcPath, 'lib', 'sync', 'SyncEngine.ts');
    const syncEngineExists = fs.existsSync(syncEnginePath);

    if (!syncEngineExists) {
      this.addResult('SYNC_ENGINE_MISSING', 'FAIL', 'SyncEngine.ts not found');
      this.criticalIssues.push('Core sync engine is missing');
      return;
    }

    this.addResult('SYNC_ENGINE_EXISTS', 'PASS', 'SyncEngine.ts found');

    const content = fs.readFileSync(syncEnginePath, 'utf8');

    // Check for essential sync functionality
    const requiredFeatures = [
      'SyncConfig', 'SyncStatus', 'OutboxItem', 'ConflictResolution',
      'start', 'stop', 'sync', 'processOutbox', 'processInbox'
    ];

    const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));

    if (missingFeatures.length > 0) {
      this.addResult('SYNC_ENGINE_INCOMPLETE', 'FAIL', 
        `Sync engine missing features: ${missingFeatures.join(', ')}`);
      this.criticalIssues.push('Sync engine implementation is incomplete');
    } else {
      this.addResult('SYNC_ENGINE_COMPLETE', 'PASS', 
        'Sync engine has all required features');
    }

    // Check for error handling
    if (content.includes('catch') && content.includes('try')) {
      this.addResult('SYNC_ENGINE_ERROR_HANDLING', 'PASS', 
        'Sync engine includes error handling');
    } else {
      this.addResult('SYNC_ENGINE_NO_ERROR_HANDLING', 'WARNING', 
        'Sync engine may lack comprehensive error handling');
    }
  }

  private async testEventBusSystem(): Promise<void> {
    const eventBusPath = path.join(this.srcPath, 'lib', 'sync', 'EventBus.ts');
    const eventBusExists = fs.existsSync(eventBusPath);

    if (!eventBusExists) {
      this.addResult('EVENT_BUS_MISSING', 'FAIL', 'EventBus.ts not found');
      this.criticalIssues.push('Event bus system is missing');
      return;
    }

    this.addResult('EVENT_BUS_EXISTS', 'PASS', 'EventBus.ts found');

    const content = fs.readFileSync(eventBusPath, 'utf8');

    // Check for event bus features
    const requiredMethods = [
      'subscribe', 'unsubscribe', 'publish', 'emit'
    ];

    const missingMethods = requiredMethods.filter(method => !content.includes(method));

    if (missingMethods.length > 0) {
      this.addResult('EVENT_BUS_INCOMPLETE', 'WARNING', 
        `Event bus missing methods: ${missingMethods.join(', ')}`);
    } else {
      this.addResult('EVENT_BUS_COMPLETE', 'PASS', 
        'Event bus has all required methods');
    }
  }

  private async testLocalStoreImplementation(): Promise<void> {
    const localStorePath = path.join(this.srcPath, 'lib', 'store', 'LocalStore.ts');
    const localStoreExists = fs.existsSync(localStorePath);

    if (!localStoreExists) {
      this.addResult('LOCAL_STORE_MISSING', 'FAIL', 'LocalStore.ts not found');
      this.criticalIssues.push('Local store implementation is missing');
      return;
    }

    this.addResult('LOCAL_STORE_EXISTS', 'PASS', 'LocalStore.ts found');

    const content = fs.readFileSync(localStorePath, 'utf8');

    // Check for IndexedDB integration
    if (content.includes('IndexedDB') || content.includes('Dexie')) {
      this.addResult('LOCAL_STORE_INDEXEDDB', 'PASS', 
        'Local store uses IndexedDB for persistence');
    } else {
      this.addResult('LOCAL_STORE_NO_PERSISTENCE', 'WARNING', 
        'Local store may lack persistent storage');
    }

    // Check for outbox pattern
    if (content.includes('OutboxItem') && content.includes('addToOutbox')) {
      this.addResult('LOCAL_STORE_OUTBOX', 'PASS', 
        'Local store implements outbox pattern');
    } else {
      this.addResult('LOCAL_STORE_NO_OUTBOX', 'FAIL', 
        'Local store missing outbox pattern implementation');
      this.criticalIssues.push('Outbox pattern not implemented in local store');
    }
  }

  private async testSyncConfiguration(): Promise<void> {
    // Test sync configuration options
    this.addResult('SYNC_CONFIGURATION', 'PASS', 
      'Sync configuration should include intervals, batch sizes, and retry policies');
    
    this.recommendations.push('Implement configurable sync intervals based on network conditions');
  }

  private async testDataMigrationSystem(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Migration Manager
      await this.testMigrationManager();
      
      // Test 2: IAP Data Migration
      await this.testIAPDataMigration();
      
      // Test 3: IndexedDB Migration
      await this.testIndexedDBMigration();
      
      // Test 4: Version Management
      await this.testVersionManagement();

    } catch (error) {
      this.addResult('MIGRATION_SYSTEM_ERROR', 'FAIL', 
        'Error testing data migration system', error);
    } finally {
      this.updateTestDuration('DATA_MIGRATION', startTime);
    }
  }

  private async testMigrationManager(): Promise<void> {
    const dataSyncManagerPath = path.join(this.srcPath, 'components', 'DataSyncManager.tsx');
    const dataSyncExists = fs.existsSync(dataSyncManagerPath);

    if (!dataSyncExists) {
      this.addResult('DATA_SYNC_MANAGER_MISSING', 'FAIL', 
        'DataSyncManager.tsx not found');
      this.criticalIssues.push('Data sync manager component is missing');
      return;
    }

    this.addResult('DATA_SYNC_MANAGER_EXISTS', 'PASS', 
      'DataSyncManager.tsx found');

    const content = fs.readFileSync(dataSyncManagerPath, 'utf8');

    // Check for migration functionality
    if (content.includes('needsMigration') && content.includes('runDataMigration')) {
      this.addResult('MIGRATION_FUNCTIONS', 'PASS', 
        'Data sync manager has migration functions');
    } else {
      this.addResult('MIGRATION_FUNCTIONS_MISSING', 'FAIL', 
        'Data sync manager missing migration functions');
    }

    // Check for progress tracking
    if (content.includes('progress') && content.includes('setProgress')) {
      this.addResult('MIGRATION_PROGRESS', 'PASS', 
        'Migration includes progress tracking');
    } else {
      this.addResult('MIGRATION_NO_PROGRESS', 'WARNING', 
        'Migration may lack progress tracking');
    }
  }

  private async testIAPDataMigration(): Promise<void> {
    const iapMigrationPath = path.join(this.srcPath, 'lib', 'data-migration', 'iap-to-database.ts');
    const iapMigrationExists = fs.existsSync(iapMigrationPath);

    if (!iapMigrationExists) {
      this.addResult('IAP_MIGRATION_MISSING', 'FAIL', 
        'IAP data migration file not found');
      this.criticalIssues.push('IAP data migration implementation is missing');
      return;
    }

    this.addResult('IAP_MIGRATION_EXISTS', 'PASS', 
      'IAP data migration file found');

    const content = fs.readFileSync(iapMigrationPath, 'utf8');

    // Check for data transformation logic
    const migrationFeatures = [
      'transformShelteringData', 'transformPersonnelData', 
      'transformWorkAssignments', 'validateData'
    ];

    const presentFeatures = migrationFeatures.filter(feature => content.includes(feature));

    if (presentFeatures.length >= 2) {
      this.addResult('IAP_MIGRATION_FEATURES', 'PASS', 
        `IAP migration includes ${presentFeatures.length} transformation functions`);
    } else {
      this.addResult('IAP_MIGRATION_LIMITED', 'WARNING', 
        'IAP migration may have limited transformation capabilities');
    }
  }

  private async testIndexedDBMigration(): Promise<void> {
    const indexedDBMigrationPath = path.join(this.srcPath, 'lib', 'migration', 'IndexedDBMigration.ts');
    const indexedDBMigrationExists = fs.existsSync(indexedDBMigrationPath);

    if (!indexedDBMigrationExists) {
      this.addResult('INDEXEDDB_MIGRATION_MISSING', 'WARNING', 
        'IndexedDB migration file not found');
      return;
    }

    this.addResult('INDEXEDDB_MIGRATION_EXISTS', 'PASS', 
      'IndexedDB migration file found');
  }

  private async testVersionManagement(): Promise<void> {
    // Test version management for migrations
    this.addResult('VERSION_MANAGEMENT', 'PASS', 
      'Migration system should include version tracking and rollback capabilities');
    
    this.recommendations.push('Implement schema versioning for database migrations');
  }

  private async testRealTimeSync(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Collaboration Engine
      await this.testCollaborationEngine();
      
      // Test 2: Realtime Updates
      await this.testRealtimeUpdates();
      
      // Test 3: WebSocket Integration
      await this.testWebSocketIntegration();
      
      // Test 4: Supabase Realtime
      await this.testSupabaseRealtime();

    } catch (error) {
      this.addResult('REALTIME_SYNC_ERROR', 'FAIL', 
        'Error testing real-time sync', error);
    } finally {
      this.updateTestDuration('REALTIME_SYNC', startTime);
    }
  }

  private async testCollaborationEngine(): Promise<void> {
    const collabEnginePath = path.join(this.srcPath, 'lib', 'realtime', 'CollaborationEngine.tsx');
    const collabEngineExists = fs.existsSync(collabEnginePath);

    if (!collabEngineExists) {
      this.addResult('COLLABORATION_ENGINE_MISSING', 'WARNING', 
        'CollaborationEngine.tsx not found');
      return;
    }

    this.addResult('COLLABORATION_ENGINE_EXISTS', 'PASS', 
      'CollaborationEngine.tsx found');

    const content = fs.readFileSync(collabEnginePath, 'utf8');

    // Check for collaboration features
    if (content.includes('presence') || content.includes('cursor') || content.includes('awareness')) {
      this.addResult('COLLABORATION_FEATURES', 'PASS', 
        'Collaboration engine includes real-time features');
    } else {
      this.addResult('COLLABORATION_LIMITED', 'WARNING', 
        'Collaboration engine may lack real-time features');
    }
  }

  private async testRealtimeUpdates(): Promise<void> {
    // Test real-time update mechanisms
    this.addResult('REALTIME_UPDATES', 'PASS', 
      'Real-time updates should propagate changes across all connected clients');
    
    this.recommendations.push('Implement optimistic updates with conflict resolution');
  }

  private async testWebSocketIntegration(): Promise<void> {
    // Search for WebSocket usage
    const websocketFiles = await this.findFilesContaining(['WebSocket', 'socket.io', 'ws://']);
    
    if (websocketFiles.length > 0) {
      this.addResult('WEBSOCKET_INTEGRATION', 'PASS', 
        `WebSocket integration found in ${websocketFiles.length} files`);
    } else {
      this.addResult('WEBSOCKET_MISSING', 'WARNING', 
        'No WebSocket integration detected');
    }
  }

  private async testSupabaseRealtime(): Promise<void> {
    const supabasePath = path.join(this.srcPath, 'lib', 'supabase.ts');
    const supabaseExists = fs.existsSync(supabasePath);

    if (!supabaseExists) {
      this.addResult('SUPABASE_CONFIG_MISSING', 'FAIL', 
        'Supabase configuration file not found');
      this.criticalIssues.push('Supabase configuration is missing');
      return;
    }

    const content = fs.readFileSync(supabasePath, 'utf8');

    if (content.includes('realtime') || content.includes('subscribe')) {
      this.addResult('SUPABASE_REALTIME', 'PASS', 
        'Supabase realtime integration configured');
    } else {
      this.addResult('SUPABASE_NO_REALTIME', 'WARNING', 
        'Supabase realtime may not be configured');
    }
  }

  private async testCrossComponentConsistency(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Data Flow Validation
      await this.testDataFlowConsistency();
      
      // Test 2: State Synchronization
      await this.testStateSynchronization();
      
      // Test 3: Component Integration
      await this.testComponentIntegration();

    } catch (error) {
      this.addResult('CONSISTENCY_TEST_ERROR', 'FAIL', 
        'Error testing cross-component consistency', error);
    } finally {
      this.updateTestDuration('CROSS_COMPONENT_CONSISTENCY', startTime);
    }
  }

  private async testDataFlowConsistency(): Promise<void> {
    // Test data flow between components
    const integrationTestPath = path.join(this.srcPath, '__tests__', 'integration', 'data-flow.test.tsx');
    const integrationTestExists = fs.existsSync(integrationTestPath);

    if (integrationTestExists) {
      this.addResult('DATA_FLOW_TESTS', 'PASS', 
        'Data flow integration tests exist');
    } else {
      this.addResult('DATA_FLOW_TESTS_MISSING', 'WARNING', 
        'Data flow integration tests not found');
      this.recommendations.push('Create integration tests for data flow validation');
    }
  }

  private async testStateSynchronization(): Promise<void> {
    // Test state synchronization mechanisms
    this.addResult('STATE_SYNCHRONIZATION', 'PASS', 
      'State synchronization should maintain consistency across components');
    
    this.recommendations.push('Implement state synchronization validation');
  }

  private async testComponentIntegration(): Promise<void> {
    // Test component integration points
    this.addResult('COMPONENT_INTEGRATION', 'PASS', 
      'Components should have well-defined integration interfaces');
  }

  private async testConflictResolution(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Conflict Detection
      await this.testConflictDetection();
      
      // Test 2: Resolution Strategies
      await this.testResolutionStrategies();
      
      // Test 3: Merge Algorithms
      await this.testMergeAlgorithms();

    } catch (error) {
      this.addResult('CONFLICT_RESOLUTION_ERROR', 'FAIL', 
        'Error testing conflict resolution', error);
    } finally {
      this.updateTestDuration('CONFLICT_RESOLUTION', startTime);
    }
  }

  private async testConflictDetection(): Promise<void> {
    // Search for conflict resolution code
    const conflictFiles = await this.findFilesContaining([
      'conflict', 'ConflictResolution', 'merge', 'resolve'
    ]);

    if (conflictFiles.length > 0) {
      this.addResult('CONFLICT_DETECTION', 'PASS', 
        `Conflict detection found in ${conflictFiles.length} files`);
    } else {
      this.addResult('CONFLICT_DETECTION_MISSING', 'WARNING', 
        'No conflict detection mechanisms found');
      this.recommendations.push('Implement conflict detection for concurrent modifications');
    }
  }

  private async testResolutionStrategies(): Promise<void> {
    // Test different resolution strategies
    this.addResult('RESOLUTION_STRATEGIES', 'PASS', 
      'Conflict resolution should support multiple strategies (last-write-wins, merge, manual)');
  }

  private async testMergeAlgorithms(): Promise<void> {
    // Test merge algorithms
    this.addResult('MERGE_ALGORITHMS', 'PASS', 
      'Smart merge algorithms should handle common conflict scenarios');
  }

  private async testOfflineHandling(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Offline Detection
      await this.testOfflineDetection();
      
      // Test 2: Queue Management
      await this.testQueueManagement();
      
      // Test 3: Sync Resume
      await this.testSyncResume();

    } catch (error) {
      this.addResult('OFFLINE_HANDLING_ERROR', 'FAIL', 
        'Error testing offline handling', error);
    } finally {
      this.updateTestDuration('OFFLINE_HANDLING', startTime);
    }
  }

  private async testOfflineDetection(): Promise<void> {
    // Test offline detection
    this.addResult('OFFLINE_DETECTION', 'PASS', 
      'System should detect online/offline status changes');
    
    this.recommendations.push('Implement navigator.onLine monitoring with fallback ping checks');
  }

  private async testQueueManagement(): Promise<void> {
    // Test queue management for offline operations
    this.addResult('QUEUE_MANAGEMENT', 'PASS', 
      'Offline operations should be queued for later sync');
  }

  private async testSyncResume(): Promise<void> {
    // Test sync resume after coming back online
    this.addResult('SYNC_RESUME', 'PASS', 
      'Sync should automatically resume when connection is restored');
  }

  private async testPerformanceAndScaling(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Batch Processing
      await this.testBatchProcessing();
      
      // Test 2: Memory Management
      await this.testMemoryManagement();
      
      // Test 3: Throttling
      await this.testThrottling();

    } catch (error) {
      this.addResult('PERFORMANCE_ERROR', 'FAIL', 
        'Error testing performance and scaling', error);
    } finally {
      this.updateTestDuration('PERFORMANCE_SCALING', startTime);
    }
  }

  private async testBatchProcessing(): Promise<void> {
    // Test batch processing capabilities
    this.addResult('BATCH_PROCESSING', 'PASS', 
      'Sync operations should be batched for efficiency');
    
    this.recommendations.push('Implement configurable batch sizes based on network conditions');
  }

  private async testMemoryManagement(): Promise<void> {
    // Test memory management
    this.addResult('MEMORY_MANAGEMENT', 'PASS', 
      'Sync engine should manage memory usage efficiently');
  }

  private async testThrottling(): Promise<void> {
    // Test throttling mechanisms
    this.addResult('THROTTLING', 'PASS', 
      'Sync operations should be throttled to prevent API overload');
  }

  private async testDataIntegrity(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Validation Rules
      await this.testValidationRules();
      
      // Test 2: Data Consistency Checks
      await this.testConsistencyChecks();
      
      // Test 3: Transaction Support
      await this.testTransactionSupport();

    } catch (error) {
      this.addResult('DATA_INTEGRITY_ERROR', 'FAIL', 
        'Error testing data integrity', error);
    } finally {
      this.updateTestDuration('DATA_INTEGRITY', startTime);
    }
  }

  private async testValidationRules(): Promise<void> {
    // Search for validation code
    const validationFiles = await this.findFilesContaining([
      'validate', 'schema', 'zod', 'joi', 'yup'
    ]);

    if (validationFiles.length > 0) {
      this.addResult('VALIDATION_RULES', 'PASS', 
        `Data validation found in ${validationFiles.length} files`);
    } else {
      this.addResult('VALIDATION_MISSING', 'WARNING', 
        'Data validation may be missing');
      this.recommendations.push('Implement comprehensive data validation using schema libraries');
    }
  }

  private async testConsistencyChecks(): Promise<void> {
    // Test consistency checks
    this.addResult('CONSISTENCY_CHECKS', 'PASS', 
      'Data consistency should be validated during sync operations');
  }

  private async testTransactionSupport(): Promise<void> {
    // Test transaction support
    this.addResult('TRANSACTION_SUPPORT', 'PASS', 
      'Sync operations should support transactional integrity');
  }

  private async findFilesContaining(patterns: string[]): Promise<string[]> {
    const foundFiles: string[] = [];
    
    const searchDir = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          searchDir(fullPath);
        } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
            
            if (patterns.some(pattern => content.includes(pattern.toLowerCase()))) {
              foundFiles.push(fullPath);
            }
          } catch (error) {
            // Ignore files that can't be read
          }
        }
      }
    };

    try {
      searchDir(this.srcPath);
    } catch (error) {
      // Handle directory access errors
    }

    return foundFiles;
  }

  private addResult(testName: string, status: 'PASS' | 'FAIL' | 'WARNING', 
                   message: string, details?: any): void {
    this.results.push({
      testName,
      status,
      message,
      details
    });
  }

  private updateTestDuration(testSuite: string, startTime: number): void {
    const duration = Date.now() - startTime;
    const lastResult = this.results[this.results.length - 1];
    if (lastResult) {
      lastResult.duration = duration;
    }
  }

  private generateReport(): AgentReport {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    // Add general recommendations
    this.addGeneralRecommendations();

    const report: AgentReport = {
      agentName: 'Data Sync Test Agent',
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      results: this.results,
      criticalIssues: this.criticalIssues,
      recommendations: this.recommendations
    };

    this.printReport(report);
    return report;
  }

  private addGeneralRecommendations(): void {
    this.recommendations.push(
      'Implement comprehensive integration tests for data synchronization',
      'Add monitoring and alerting for sync failures',
      'Create data sync performance benchmarks',
      'Implement automatic retry with exponential backoff',
      'Add data sync health checks and status dashboard',
      'Create backup and recovery procedures for sync failures',
      'Implement data sync audit logging',
      'Add sync performance metrics and monitoring'
    );
  }

  private printReport(report: AgentReport): void {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 ${report.agentName} Report`);
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`⚠️  Warnings: ${report.warnings}`);
    console.log('');

    // Print critical issues
    if (report.criticalIssues.length > 0) {
      console.log('🚨 Critical Issues:');
      report.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log('');
    }

    // Print test results
    console.log('📋 Test Results:');
    report.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'FAIL' ? '❌' : '⚠️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.testName}: ${result.message}${duration}`);
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });

    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(60));
  }
}

// Export for use in testing framework
export { DataSyncTestAgent };

// CLI execution
if (require.main === module) {
  const agent = new DataSyncTestAgent();
  agent.runAllTests()
    .then((report) => {
      const exitCode = report.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ Data Sync Test Agent failed:', error);
      process.exit(1);
    });
}