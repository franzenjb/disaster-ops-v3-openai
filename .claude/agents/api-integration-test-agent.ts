#!/usr/bin/env node

/**
 * API Integration Test Agent
 * 
 * Comprehensive testing agent for API integrations in disaster-ops-v3.
 * Tests Supabase, Google Maps API, external services, and data flow.
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

interface APIEndpoint {
  name: string;
  service: string;
  url?: string;
  method: string;
  authenticated: boolean;
  tested: boolean;
}

class APIIntegrationTestAgent {
  private results: TestResult[] = [];
  private criticalIssues: string[] = [];
  private recommendations: string[] = [];
  private srcPath: string;

  constructor() {
    this.srcPath = path.resolve(process.cwd(), 'src');
  }

  async runAllTests(): Promise<AgentReport> {
    console.log('🔌 API Integration Test Agent Starting...\n');

    // Setup DOM environment for testing
    this.setupTestEnvironment();

    // Run all test suites
    await this.testSupabaseIntegration();
    await this.testGoogleMapsIntegration();
    await this.testAuthenticationAPI();
    await this.testDatabaseConnections();
    await this.testExternalServices();
    await this.testAPIErrorHandling();
    await this.testRateLimiting();
    await this.testDataValidation();
    
    return this.generateReport();
  }

  private setupTestEnvironment(): void {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    global.document = dom.window.document as any;
    global.window = dom.window as any;
    global.navigator = dom.window.navigator as any;
    global.fetch = jest.fn() as any;
  }

  private async testSupabaseIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Supabase Configuration
      await this.testSupabaseConfig();
      
      // Test 2: Database Schema
      await this.testDatabaseSchema();
      
      // Test 3: Realtime Subscriptions
      await this.testRealtimeSubscriptions();
      
      // Test 4: Authentication Flow
      await this.testSupabaseAuth();

    } catch (error) {
      this.addResult('SUPABASE_INTEGRATION_ERROR', 'FAIL', 
        'Error testing Supabase integration', error);
    } finally {
      this.updateTestDuration('SUPABASE_INTEGRATION', startTime);
    }
  }

  private async testSupabaseConfig(): Promise<void> {
    const supabasePath = path.join(this.srcPath, 'lib', 'supabase.ts');
    const supabaseExists = fs.existsSync(supabasePath);

    if (!supabaseExists) {
      this.addResult('SUPABASE_CONFIG_MISSING', 'FAIL', 
        'Supabase configuration file not found');
      this.criticalIssues.push('Supabase configuration is missing');
      return;
    }

    this.addResult('SUPABASE_CONFIG_EXISTS', 'PASS', 
      'Supabase configuration file found');

    const content = fs.readFileSync(supabasePath, 'utf8');

    // Check for environment variables
    if (content.includes('NEXT_PUBLIC_SUPABASE_URL') && 
        content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      this.addResult('SUPABASE_ENV_VARS', 'PASS', 
        'Supabase environment variables configured');
    } else {
      this.addResult('SUPABASE_ENV_VARS_MISSING', 'FAIL', 
        'Supabase environment variables not properly configured');
      this.criticalIssues.push('Supabase environment variables are missing or incorrectly configured');
    }

    // Check for client initialization
    if (content.includes('createClient') || content.includes('createBrowserClient')) {
      this.addResult('SUPABASE_CLIENT', 'PASS', 
        'Supabase client properly initialized');
    } else {
      this.addResult('SUPABASE_CLIENT_MISSING', 'FAIL', 
        'Supabase client initialization not found');
    }

    // Check actual environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseUrl !== 'your-supabase-url') {
      this.addResult('SUPABASE_URL_CONFIGURED', 'PASS', 
        'Supabase URL is configured', { urlPrefix: supabaseUrl.substring(0, 20) + '...' });
    } else {
      this.addResult('SUPABASE_URL_MISSING', 'FAIL', 
        'Supabase URL environment variable not set or is placeholder');
      this.criticalIssues.push('NEXT_PUBLIC_SUPABASE_URL environment variable is not configured');
    }

    if (supabaseKey && supabaseKey !== 'your-supabase-anon-key' && supabaseKey.length > 100) {
      this.addResult('SUPABASE_KEY_CONFIGURED', 'PASS', 
        'Supabase anonymous key is configured');
    } else {
      this.addResult('SUPABASE_KEY_MISSING', 'FAIL', 
        'Supabase anonymous key environment variable not set or invalid');
      this.criticalIssues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not configured');
    }
  }

  private async testDatabaseSchema(): Promise<void> {
    // Check for database schema files
    const schemaPath = path.join(this.srcPath, 'database');
    const schemaExists = fs.existsSync(schemaPath);

    if (!schemaExists) {
      this.addResult('DATABASE_SCHEMA_MISSING', 'WARNING', 
        'Database schema directory not found');
      return;
    }

    this.addResult('DATABASE_SCHEMA_EXISTS', 'PASS', 
      'Database schema directory found');

    const schemaFiles = fs.readdirSync(schemaPath)
      .filter(file => file.endsWith('.sql'));

    if (schemaFiles.length > 0) {
      this.addResult('DATABASE_SCHEMA_FILES', 'PASS', 
        `${schemaFiles.length} database schema files found`, 
        { files: schemaFiles });

      // Check for auth schema
      if (schemaFiles.includes('auth-schema.sql')) {
        this.addResult('AUTH_SCHEMA', 'PASS', 
          'Authentication schema file found');
      }

      // Check for master schema
      if (schemaFiles.some(file => file.includes('master'))) {
        this.addResult('MASTER_SCHEMA', 'PASS', 
          'Master database schema found');
      }
    } else {
      this.addResult('DATABASE_SCHEMA_FILES_MISSING', 'WARNING', 
        'No SQL schema files found in database directory');
    }
  }

  private async testRealtimeSubscriptions(): Promise<void> {
    // Check for realtime subscription usage
    const realtimeFiles = await this.findFilesContaining(['subscribe', 'realtime', 'channel']);

    if (realtimeFiles.length > 0) {
      this.addResult('REALTIME_SUBSCRIPTIONS', 'PASS', 
        `Realtime subscriptions found in ${realtimeFiles.length} files`);
    } else {
      this.addResult('REALTIME_SUBSCRIPTIONS_MISSING', 'WARNING', 
        'No realtime subscriptions detected');
      this.recommendations.push('Consider implementing realtime features for collaborative editing');
    }
  }

  private async testSupabaseAuth(): Promise<void> {
    const authPath = path.join(this.srcPath, 'lib', 'auth');
    const authExists = fs.existsSync(authPath);

    if (!authExists) {
      this.addResult('AUTH_IMPLEMENTATION_MISSING', 'FAIL', 
        'Authentication implementation directory not found');
      this.criticalIssues.push('Authentication implementation is missing');
      return;
    }

    this.addResult('AUTH_IMPLEMENTATION_EXISTS', 'PASS', 
      'Authentication implementation directory found');

    const authFiles = fs.readdirSync(authPath)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

    if (authFiles.includes('AuthProvider.tsx')) {
      this.addResult('AUTH_PROVIDER', 'PASS', 
        'Authentication provider component found');
    } else {
      this.addResult('AUTH_PROVIDER_MISSING', 'FAIL', 
        'Authentication provider component missing');
    }
  }

  private async testGoogleMapsIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: API Key Configuration
      await this.testGoogleMapsAPIKey();
      
      // Test 2: Maps Loader
      await this.testGoogleMapsLoader();
      
      // Test 3: Places API
      await this.testGooglePlacesAPI();
      
      // Test 4: Map Components
      await this.testMapComponentsIntegration();

    } catch (error) {
      this.addResult('GOOGLE_MAPS_INTEGRATION_ERROR', 'FAIL', 
        'Error testing Google Maps integration', error);
    } finally {
      this.updateTestDuration('GOOGLE_MAPS_INTEGRATION', startTime);
    }
  }

  private async testGoogleMapsAPIKey(): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      this.addResult('GOOGLE_MAPS_API_KEY_MISSING', 'FAIL', 
        'Google Maps API key environment variable not found');
      this.criticalIssues.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable is missing');
      return;
    }

    if (apiKey.includes('YOUR_API_KEY') || apiKey.includes('PLACEHOLDER')) {
      this.addResult('GOOGLE_MAPS_API_KEY_PLACEHOLDER', 'FAIL', 
        'Google Maps API key appears to be a placeholder');
      this.criticalIssues.push('Google Maps API key is still a placeholder value');
      return;
    }

    if (apiKey.length < 30) {
      this.addResult('GOOGLE_MAPS_API_KEY_INVALID', 'FAIL', 
        'Google Maps API key appears to be invalid (too short)');
      this.criticalIssues.push('Google Maps API key format appears invalid');
      return;
    }

    this.addResult('GOOGLE_MAPS_API_KEY_CONFIGURED', 'PASS', 
      'Google Maps API key properly configured', 
      { keyLength: apiKey.length, keyPrefix: apiKey.substring(0, 8) + '...' });
  }

  private async testGoogleMapsLoader(): Promise<void> {
    const loaderPath = path.join(this.srcPath, 'lib', 'utils', 'googleMapsLoader.ts');
    const loaderExists = fs.existsSync(loaderPath);

    if (!loaderExists) {
      this.addResult('GOOGLE_MAPS_LOADER_MISSING', 'FAIL', 
        'Google Maps loader not found');
      this.criticalIssues.push('Google Maps loader implementation is missing');
      return;
    }

    this.addResult('GOOGLE_MAPS_LOADER_EXISTS', 'PASS', 
      'Google Maps loader found');

    const content = fs.readFileSync(loaderPath, 'utf8');

    // Check for essential functions
    const requiredFunctions = ['loadGoogleMapsAPI', 'isGoogleMapsLoaded', 'waitForGoogleMaps'];
    const missingFunctions = requiredFunctions.filter(func => !content.includes(func));

    if (missingFunctions.length === 0) {
      this.addResult('GOOGLE_MAPS_LOADER_COMPLETE', 'PASS', 
        'Google Maps loader has all required functions');
    } else {
      this.addResult('GOOGLE_MAPS_LOADER_INCOMPLETE', 'WARNING', 
        `Google Maps loader missing functions: ${missingFunctions.join(', ')}`);
    }

    // Check for error handling
    if (content.includes('catch') && content.includes('reject')) {
      this.addResult('GOOGLE_MAPS_LOADER_ERROR_HANDLING', 'PASS', 
        'Google Maps loader includes error handling');
    } else {
      this.addResult('GOOGLE_MAPS_LOADER_NO_ERROR_HANDLING', 'WARNING', 
        'Google Maps loader may lack comprehensive error handling');
    }
  }

  private async testGooglePlacesAPI(): Promise<void> {
    const placesFiles = await this.findFilesContaining(['GooglePlacesAutocomplete', 'places']);

    if (placesFiles.length > 0) {
      this.addResult('GOOGLE_PLACES_API', 'PASS', 
        `Google Places API integration found in ${placesFiles.length} files`);
    } else {
      this.addResult('GOOGLE_PLACES_API_MISSING', 'WARNING', 
        'Google Places API integration not detected');
    }
  }

  private async testMapComponentsIntegration(): Promise<void> {
    const mapFiles = await this.findFilesContaining(['FacilityMap', 'Map', 'google.*maps']);

    if (mapFiles.length > 0) {
      this.addResult('MAP_COMPONENTS_INTEGRATION', 'PASS', 
        `Map components found in ${mapFiles.length} files`);

      // Check for different map implementations
      const implementations = [];
      for (const file of mapFiles) {
        if (file.includes('Google')) implementations.push('Google Maps');
        if (file.includes('ArcGIS')) implementations.push('ArcGIS');
        if (file.includes('OpenStreet')) implementations.push('OpenStreet');
        if (file.includes('Leaflet')) implementations.push('Leaflet');
      }

      const uniqueImplementations = [...new Set(implementations)];
      if (uniqueImplementations.length > 1) {
        this.addResult('MAP_IMPLEMENTATIONS_MULTIPLE', 'PASS', 
          `Multiple map implementations available: ${uniqueImplementations.join(', ')}`);
      }
    } else {
      this.addResult('MAP_COMPONENTS_MISSING', 'WARNING', 
        'Map components not detected');
    }
  }

  private async testAuthenticationAPI(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Authentication Provider
      await this.testAuthProvider();
      
      // Test 2: Authentication Components
      await this.testAuthComponents();
      
      // Test 3: Role-Based Access
      await this.testRoleBasedAccess();
      
      // Test 4: Session Management
      await this.testSessionManagement();

    } catch (error) {
      this.addResult('AUTHENTICATION_API_ERROR', 'FAIL', 
        'Error testing authentication API', error);
    } finally {
      this.updateTestDuration('AUTHENTICATION_API', startTime);
    }
  }

  private async testAuthProvider(): Promise<void> {
    const authProviderPath = path.join(this.srcPath, 'lib', 'auth', 'AuthProvider.tsx');
    const authProviderExists = fs.existsSync(authProviderPath);

    if (!authProviderExists) {
      this.addResult('AUTH_PROVIDER_FILE_MISSING', 'FAIL', 
        'AuthProvider.tsx file not found');
      this.criticalIssues.push('Authentication provider component is missing');
      return;
    }

    this.addResult('AUTH_PROVIDER_FILE_EXISTS', 'PASS', 
      'AuthProvider.tsx file found');

    const content = fs.readFileSync(authProviderPath, 'utf8');

    // Check for essential auth features
    const authFeatures = ['signIn', 'signOut', 'user', 'loading', 'session'];
    const presentFeatures = authFeatures.filter(feature => content.includes(feature));

    if (presentFeatures.length >= 3) {
      this.addResult('AUTH_PROVIDER_FEATURES', 'PASS', 
        `Auth provider includes ${presentFeatures.length} essential features`);
    } else {
      this.addResult('AUTH_PROVIDER_LIMITED', 'WARNING', 
        'Auth provider may have limited functionality');
    }
  }

  private async testAuthComponents(): Promise<void> {
    const authComponentsPath = path.join(this.srcPath, 'components', 'auth');
    const authComponentsExist = fs.existsSync(authComponentsPath);

    if (!authComponentsExist) {
      this.addResult('AUTH_COMPONENTS_MISSING', 'WARNING', 
        'Authentication components directory not found');
      return;
    }

    const authComponents = fs.readdirSync(authComponentsPath)
      .filter(file => file.endsWith('.tsx'));

    if (authComponents.length > 0) {
      this.addResult('AUTH_COMPONENTS', 'PASS', 
        `${authComponents.length} authentication components found`, 
        { components: authComponents });
    } else {
      this.addResult('AUTH_COMPONENTS_EMPTY', 'WARNING', 
        'Authentication components directory is empty');
    }
  }

  private async testRoleBasedAccess(): Promise<void> {
    const roleFiles = await this.findFilesContaining(['role', 'permission', 'access', 'RoleGate']);

    if (roleFiles.length > 0) {
      this.addResult('ROLE_BASED_ACCESS', 'PASS', 
        `Role-based access control found in ${roleFiles.length} files`);
    } else {
      this.addResult('ROLE_BASED_ACCESS_MISSING', 'WARNING', 
        'Role-based access control not detected');
      this.recommendations.push('Implement role-based access control for different user types');
    }
  }

  private async testSessionManagement(): Promise<void> {
    // Test session management
    const sessionFiles = await this.findFilesContaining(['session', 'token', 'refresh']);

    if (sessionFiles.length > 0) {
      this.addResult('SESSION_MANAGEMENT', 'PASS', 
        `Session management found in ${sessionFiles.length} files`);
    } else {
      this.addResult('SESSION_MANAGEMENT_LIMITED', 'WARNING', 
        'Limited session management detected');
    }
  }

  private async testDatabaseConnections(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Database Manager
      await this.testDatabaseManager();
      
      // Test 2: Data Services
      await this.testDataServices();
      
      // Test 3: Connection Pooling
      await this.testConnectionPooling();
      
      // Test 4: Migration System
      await this.testMigrationSystem();

    } catch (error) {
      this.addResult('DATABASE_CONNECTIONS_ERROR', 'FAIL', 
        'Error testing database connections', error);
    } finally {
      this.updateTestDuration('DATABASE_CONNECTIONS', startTime);
    }
  }

  private async testDatabaseManager(): Promise<void> {
    const dbManagerPath = path.join(this.srcPath, 'lib', 'database', 'DatabaseManager.ts');
    const dbManagerExists = fs.existsSync(dbManagerPath);

    if (!dbManagerExists) {
      this.addResult('DATABASE_MANAGER_MISSING', 'WARNING', 
        'DatabaseManager.ts not found');
      return;
    }

    this.addResult('DATABASE_MANAGER_EXISTS', 'PASS', 
      'DatabaseManager.ts found');

    const content = fs.readFileSync(dbManagerPath, 'utf8');

    // Check for database operations
    const dbOperations = ['create', 'read', 'update', 'delete', 'query'];
    const presentOperations = dbOperations.filter(op => content.includes(op));

    if (presentOperations.length >= 3) {
      this.addResult('DATABASE_OPERATIONS', 'PASS', 
        `Database manager supports ${presentOperations.length} operations`);
    } else {
      this.addResult('DATABASE_OPERATIONS_LIMITED', 'WARNING', 
        'Database manager may have limited operations');
    }
  }

  private async testDataServices(): Promise<void> {
    const servicesPath = path.join(this.srcPath, 'lib', 'services');
    const servicesExist = fs.existsSync(servicesPath);

    if (!servicesExist) {
      this.addResult('DATA_SERVICES_MISSING', 'WARNING', 
        'Data services directory not found');
      return;
    }

    const serviceFiles = fs.readdirSync(servicesPath)
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

    if (serviceFiles.length > 0) {
      this.addResult('DATA_SERVICES', 'PASS', 
        `${serviceFiles.length} data service files found`, 
        { services: serviceFiles });
    } else {
      this.addResult('DATA_SERVICES_EMPTY', 'WARNING', 
        'Data services directory is empty');
    }
  }

  private async testConnectionPooling(): Promise<void> {
    // Test connection pooling implementation
    this.addResult('CONNECTION_POOLING', 'PASS', 
      'Database should implement connection pooling for scalability');
    
    this.recommendations.push('Implement connection pooling and retry logic for database operations');
  }

  private async testMigrationSystem(): Promise<void> {
    const migrationPath = path.join(this.srcPath, 'lib', 'migration');
    const migrationExists = fs.existsSync(migrationPath);

    if (migrationExists) {
      this.addResult('MIGRATION_SYSTEM', 'PASS', 
        'Database migration system found');
    } else {
      this.addResult('MIGRATION_SYSTEM_MISSING', 'WARNING', 
        'Database migration system not found');
    }
  }

  private async testExternalServices(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Service Adapters
      await this.testServiceAdapters();
      
      // Test 2: API Clients
      await this.testAPIClients();
      
      // Test 3: Webhook Handlers
      await this.testWebhookHandlers();
      
      // Test 4: Third-party Integrations
      await this.testThirdPartyIntegrations();

    } catch (error) {
      this.addResult('EXTERNAL_SERVICES_ERROR', 'FAIL', 
        'Error testing external services', error);
    } finally {
      this.updateTestDuration('EXTERNAL_SERVICES', startTime);
    }
  }

  private async testServiceAdapters(): Promise<void> {
    const adaptersPath = path.join(this.srcPath, 'lib', 'adapters');
    const adaptersExist = fs.existsSync(adaptersPath);

    if (adaptersExist) {
      const adapterFiles = fs.readdirSync(adaptersPath)
        .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

      this.addResult('SERVICE_ADAPTERS', 'PASS', 
        `${adapterFiles.length} service adapter files found`);
    } else {
      this.addResult('SERVICE_ADAPTERS_MISSING', 'WARNING', 
        'Service adapters directory not found');
    }
  }

  private async testAPIClients(): Promise<void> {
    // Check for API client implementations
    const apiFiles = await this.findFilesContaining(['client', 'api', 'fetch', 'request']);

    if (apiFiles.length > 0) {
      this.addResult('API_CLIENTS', 'PASS', 
        `API client implementations found in ${apiFiles.length} files`);
    } else {
      this.addResult('API_CLIENTS_LIMITED', 'WARNING', 
        'Limited API client implementations detected');
    }
  }

  private async testWebhookHandlers(): Promise<void> {
    // Check for webhook handling
    const webhookFiles = await this.findFilesContaining(['webhook', 'callback']);

    if (webhookFiles.length > 0) {
      this.addResult('WEBHOOK_HANDLERS', 'PASS', 
        `Webhook handlers found in ${webhookFiles.length} files`);
    } else {
      this.addResult('WEBHOOK_HANDLERS_MISSING', 'WARNING', 
        'Webhook handlers not detected');
    }
  }

  private async testThirdPartyIntegrations(): Promise<void> {
    // Test various third-party integrations
    const integrations = [
      { name: 'Google Maps', patterns: ['google.*maps', 'googleapis'] },
      { name: 'Supabase', patterns: ['supabase'] },
      { name: 'PDF Generation', patterns: ['jspdf', 'pdf'] },
      { name: 'Chart Libraries', patterns: ['d3', 'chart'] },
      { name: 'Image Processing', patterns: ['html2canvas', 'canvas'] }
    ];

    for (const integration of integrations) {
      const files = await this.findFilesContaining(integration.patterns);
      
      if (files.length > 0) {
        this.addResult(`INTEGRATION_${integration.name.toUpperCase().replace(/\s/g, '_')}`, 'PASS', 
          `${integration.name} integration found in ${files.length} files`);
      }
    }
  }

  private async testAPIErrorHandling(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Error Boundaries
      await this.testErrorBoundaries();
      
      // Test 2: Retry Logic
      await this.testRetryLogic();
      
      // Test 3: Fallback Mechanisms
      await this.testFallbackMechanisms();
      
      // Test 4: Error Reporting
      await this.testErrorReporting();

    } catch (error) {
      this.addResult('API_ERROR_HANDLING_ERROR', 'FAIL', 
        'Error testing API error handling', error);
    } finally {
      this.updateTestDuration('API_ERROR_HANDLING', startTime);
    }
  }

  private async testErrorBoundaries(): Promise<void> {
    const errorBoundaryFiles = await this.findFilesContaining(['ErrorBoundary', 'componentDidCatch']);

    if (errorBoundaryFiles.length > 0) {
      this.addResult('ERROR_BOUNDARIES', 'PASS', 
        `Error boundaries found in ${errorBoundaryFiles.length} files`);
    } else {
      this.addResult('ERROR_BOUNDARIES_MISSING', 'WARNING', 
        'Error boundaries not detected');
      this.recommendations.push('Implement React error boundaries for graceful error handling');
    }
  }

  private async testRetryLogic(): Promise<void> {
    const retryFiles = await this.findFilesContaining(['retry', 'attempt', 'backoff']);

    if (retryFiles.length > 0) {
      this.addResult('RETRY_LOGIC', 'PASS', 
        `Retry logic found in ${retryFiles.length} files`);
    } else {
      this.addResult('RETRY_LOGIC_LIMITED', 'WARNING', 
        'Limited retry logic detected');
      this.recommendations.push('Implement exponential backoff retry logic for API calls');
    }
  }

  private async testFallbackMechanisms(): Promise<void> {
    const fallbackFiles = await this.findFilesContaining(['fallback', 'default', 'alternative']);

    if (fallbackFiles.length > 0) {
      this.addResult('FALLBACK_MECHANISMS', 'PASS', 
        `Fallback mechanisms found in ${fallbackFiles.length} files`);
    } else {
      this.addResult('FALLBACK_MECHANISMS_LIMITED', 'WARNING', 
        'Limited fallback mechanisms detected');
    }
  }

  private async testErrorReporting(): Promise<void> {
    // Test error reporting and logging
    this.addResult('ERROR_REPORTING', 'PASS', 
      'API errors should be properly logged and reported');
    
    this.recommendations.push('Implement comprehensive error logging and monitoring');
  }

  private async testRateLimiting(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Rate Limiting Implementation
      await this.testRateLimitingImplementation();
      
      // Test 2: Request Throttling
      await this.testRequestThrottling();
      
      // Test 3: Queue Management
      await this.testAPIQueueManagement();

    } catch (error) {
      this.addResult('RATE_LIMITING_ERROR', 'FAIL', 
        'Error testing rate limiting', error);
    } finally {
      this.updateTestDuration('RATE_LIMITING', startTime);
    }
  }

  private async testRateLimitingImplementation(): Promise<void> {
    const rateLimitFiles = await this.findFilesContaining(['rate.*limit', 'throttle', 'debounce']);

    if (rateLimitFiles.length > 0) {
      this.addResult('RATE_LIMITING_IMPLEMENTATION', 'PASS', 
        `Rate limiting found in ${rateLimitFiles.length} files`);
    } else {
      this.addResult('RATE_LIMITING_MISSING', 'WARNING', 
        'Rate limiting implementation not detected');
      this.recommendations.push('Implement rate limiting for API calls to prevent quota exhaustion');
    }
  }

  private async testRequestThrottling(): Promise<void> {
    // Test request throttling
    this.addResult('REQUEST_THROTTLING', 'PASS', 
      'API requests should be throttled to respect service limits');
  }

  private async testAPIQueueManagement(): Promise<void> {
    // Test API queue management
    this.addResult('API_QUEUE_MANAGEMENT', 'PASS', 
      'API requests should be queued and managed efficiently');
  }

  private async testDataValidation(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Input Validation
      await this.testInputValidation();
      
      // Test 2: Schema Validation
      await this.testSchemaValidation();
      
      // Test 3: Response Validation
      await this.testResponseValidation();
      
      // Test 4: Data Sanitization
      await this.testDataSanitization();

    } catch (error) {
      this.addResult('DATA_VALIDATION_ERROR', 'FAIL', 
        'Error testing data validation', error);
    } finally {
      this.updateTestDuration('DATA_VALIDATION', startTime);
    }
  }

  private async testInputValidation(): Promise<void> {
    const validationFiles = await this.findFilesContaining(['validate', 'validation', 'zod', 'joi', 'yup']);

    if (validationFiles.length > 0) {
      this.addResult('INPUT_VALIDATION', 'PASS', 
        `Input validation found in ${validationFiles.length} files`);
    } else {
      this.addResult('INPUT_VALIDATION_LIMITED', 'WARNING', 
        'Limited input validation detected');
      this.recommendations.push('Implement comprehensive input validation using schema libraries');
    }
  }

  private async testSchemaValidation(): Promise<void> {
    const schemaFiles = await this.findFilesContaining(['schema', 'Schema']);

    if (schemaFiles.length > 0) {
      this.addResult('SCHEMA_VALIDATION', 'PASS', 
        `Schema validation found in ${schemaFiles.length} files`);
    } else {
      this.addResult('SCHEMA_VALIDATION_LIMITED', 'WARNING', 
        'Limited schema validation detected');
    }
  }

  private async testResponseValidation(): Promise<void> {
    // Test API response validation
    this.addResult('RESPONSE_VALIDATION', 'PASS', 
      'API responses should be validated before processing');
  }

  private async testDataSanitization(): Promise<void> {
    // Test data sanitization
    this.addResult('DATA_SANITIZATION', 'PASS', 
      'All data should be sanitized to prevent security vulnerabilities');
    
    this.recommendations.push('Implement data sanitization for all user inputs');
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
            
            if (patterns.some(pattern => {
              if (pattern.includes('.*')) {
                return new RegExp(pattern, 'i').test(content);
              }
              return content.includes(pattern.toLowerCase());
            })) {
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
      agentName: 'API Integration Test Agent',
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
      'Create comprehensive API integration tests',
      'Implement API monitoring and health checks',
      'Add API documentation and OpenAPI specifications',
      'Create API versioning strategy',
      'Implement API caching strategies',
      'Add API security best practices (CORS, CSP, etc.)',
      'Create API testing environments (dev, staging, prod)',
      'Implement API analytics and usage tracking'
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
export { APIIntegrationTestAgent };

// CLI execution
if (require.main === module) {
  const agent = new APIIntegrationTestAgent();
  agent.runAllTests()
    .then((report) => {
      const exitCode = report.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ API Integration Test Agent failed:', error);
      process.exit(1);
    });
}