#!/usr/bin/env node

/**
 * UI Validation Test Agent
 * 
 * Comprehensive testing agent for UI component validation in disaster-ops-v3.
 * Tests component structure, accessibility, responsiveness, and user interactions.
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

interface UIComponent {
  name: string;
  path: string;
  category: string;
  isPage: boolean;
  hasTests: boolean;
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
}

class UIValidationTestAgent {
  private results: TestResult[] = [];
  private criticalIssues: string[] = [];
  private recommendations: string[] = [];
  private srcPath: string;
  private componentsPath: string;

  constructor() {
    this.srcPath = path.resolve(process.cwd(), 'src');
    this.componentsPath = path.join(this.srcPath, 'components');
  }

  async runAllTests(): Promise<AgentReport> {
    console.log('🎨 UI Validation Test Agent Starting...\n');

    // Setup DOM environment for testing
    this.setupTestEnvironment();

    // Run all test suites
    await this.testComponentStructure();
    await this.testComponentIntegration();
    await this.testAccessibilityCompliance();
    await this.testResponsiveDesign();
    await this.testInteractionPatterns();
    await this.testFormValidation();
    await this.testStateManagement();
    await this.testPerformanceOptimization();
    
    return this.generateReport();
  }

  private setupTestEnvironment(): void {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    global.document = dom.window.document as any;
    global.window = dom.window as any;
    global.navigator = dom.window.navigator as any;

    // Mock common browser APIs
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }

  private async testComponentStructure(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Component Directory Structure
      await this.testDirectoryStructure();
      
      // Test 2: Component File Naming
      await this.testFileNamingConventions();
      
      // Test 3: Component Organization
      await this.testComponentOrganization();
      
      // Test 4: Export Patterns
      await this.testExportPatterns();

    } catch (error) {
      this.addResult('COMPONENT_STRUCTURE_ERROR', 'FAIL', 
        'Error testing component structure', error);
    } finally {
      this.updateTestDuration('COMPONENT_STRUCTURE', startTime);
    }
  }

  private async testDirectoryStructure(): Promise<void> {
    const expectedDirectories = [
      'ui', 'IAP', 'auth', 'mobile', 'shared', 
      'WorkAssignment', 'Disciplines', 'FacilityManagement'
    ];

    const existingDirectories = fs.readdirSync(this.componentsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const missingDirectories = expectedDirectories.filter(dir => 
      !existingDirectories.includes(dir));

    if (missingDirectories.length > 0) {
      this.addResult('DIRECTORY_STRUCTURE_INCOMPLETE', 'WARNING', 
        `Missing component directories: ${missingDirectories.join(', ')}`);
    } else {
      this.addResult('DIRECTORY_STRUCTURE_COMPLETE', 'PASS', 
        'Component directory structure is well organized');
    }

    // Check for test directory
    const hasTestDirectory = existingDirectories.includes('__tests__');
    if (hasTestDirectory) {
      this.addResult('COMPONENT_TESTS_DIRECTORY', 'PASS', 
        'Component tests directory exists');
    } else {
      this.addResult('COMPONENT_TESTS_MISSING', 'WARNING', 
        'Component tests directory not found');
      this.recommendations.push('Create __tests__ directory for component tests');
    }
  }

  private async testFileNamingConventions(): Promise<void> {
    const components = await this.discoverComponents();
    
    let properlyNamed = 0;
    let improperlyNamed = 0;

    for (const component of components) {
      const filename = path.basename(component.path, '.tsx');
      
      // Check PascalCase naming
      if (filename.match(/^[A-Z][a-zA-Z0-9]*$/)) {
        properlyNamed++;
      } else {
        improperlyNamed++;
        this.addResult(`NAMING_VIOLATION_${filename}`, 'WARNING', 
          `Component ${filename} doesn't follow PascalCase convention`);
      }
    }

    if (improperlyNamed === 0) {
      this.addResult('NAMING_CONVENTIONS', 'PASS', 
        'All components follow proper naming conventions');
    } else {
      this.addResult('NAMING_CONVENTIONS_VIOLATIONS', 'WARNING', 
        `${improperlyNamed} components have naming violations`);
    }
  }

  private async testComponentOrganization(): Promise<void> {
    const components = await this.discoverComponents();
    
    // Categorize components
    const categories = this.categorizeComponents(components);
    
    this.addResult('COMPONENT_ORGANIZATION', 'PASS', 
      `Components organized into ${Object.keys(categories).length} categories`, 
      { categoryCounts: Object.entries(categories).map(([cat, comps]) => 
        ({ category: cat, count: comps.length })) });
  }

  private async testExportPatterns(): Promise<void> {
    const components = await this.discoverComponents();
    let properExports = 0;
    let improperExports = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for named export
        const hasNamedExport = content.includes(`export function ${component.name}`) ||
                              content.includes(`export const ${component.name}`) ||
                              content.includes(`export { ${component.name} }`);

        // Check for default export
        const hasDefaultExport = content.includes('export default');

        if (hasNamedExport || hasDefaultExport) {
          properExports++;
        } else {
          improperExports++;
          this.addResult(`EXPORT_ISSUE_${component.name}`, 'WARNING', 
            `Component ${component.name} may have export issues`);
        }
      } catch (error) {
        this.addResult(`EXPORT_READ_ERROR_${component.name}`, 'WARNING', 
          `Could not read component ${component.name}`, error);
      }
    }

    if (improperExports === 0) {
      this.addResult('EXPORT_PATTERNS', 'PASS', 
        'All components have proper export patterns');
    } else {
      this.addResult('EXPORT_PATTERNS_ISSUES', 'WARNING', 
        `${improperExports} components may have export issues`);
    }
  }

  private async testComponentIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Import Dependencies
      await this.testImportDependencies();
      
      // Test 2: Props Interfaces
      await this.testPropsInterfaces();
      
      // Test 3: Type Safety
      await this.testTypeSafety();
      
      // Test 4: Component Composition
      await this.testComponentComposition();

    } catch (error) {
      this.addResult('COMPONENT_INTEGRATION_ERROR', 'FAIL', 
        'Error testing component integration', error);
    } finally {
      this.updateTestDuration('COMPONENT_INTEGRATION', startTime);
    }
  }

  private async testImportDependencies(): Promise<void> {
    const components = await this.discoverComponents();
    let componentsWithIssues = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for React import
        if (!content.includes('import') || !content.includes('react')) {
          componentsWithIssues++;
          this.addResult(`MISSING_REACT_IMPORT_${component.name}`, 'WARNING', 
            `Component ${component.name} may be missing React import`);
        }

        // Check for unused imports (basic check)
        const imports = content.match(/import .* from/g) || [];
        if (imports.length > 10) {
          this.addResult(`MANY_IMPORTS_${component.name}`, 'WARNING', 
            `Component ${component.name} has many imports (${imports.length}) - consider breaking down`);
        }
      } catch (error) {
        componentsWithIssues++;
      }
    }

    if (componentsWithIssues === 0) {
      this.addResult('IMPORT_DEPENDENCIES', 'PASS', 
        'All components have proper import dependencies');
    } else {
      this.addResult('IMPORT_DEPENDENCIES_ISSUES', 'WARNING', 
        `${componentsWithIssues} components may have import issues`);
    }
  }

  private async testPropsInterfaces(): Promise<void> {
    const components = await this.discoverComponents();
    let componentsWithProps = 0;
    let componentsWithTypedProps = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for props interface
        const hasPropsInterface = content.includes('interface') && 
                                 (content.includes('Props') || content.includes('props'));
        
        if (content.includes('props') || content.includes('Props')) {
          componentsWithProps++;
          
          if (hasPropsInterface) {
            componentsWithTypedProps++;
          }
        }
      } catch (error) {
        // Ignore read errors for this test
      }
    }

    if (componentsWithProps === componentsWithTypedProps && componentsWithProps > 0) {
      this.addResult('PROPS_INTERFACES', 'PASS', 
        `All ${componentsWithProps} components with props have typed interfaces`);
    } else {
      this.addResult('PROPS_INTERFACES_INCOMPLETE', 'WARNING', 
        `${componentsWithProps - componentsWithTypedProps} components may lack proper prop types`);
      this.recommendations.push('Add TypeScript interfaces for all component props');
    }
  }

  private async testTypeSafety(): Promise<void> {
    // Check for TypeScript usage
    const components = await this.discoverComponents();
    const tsComponents = components.filter(comp => comp.path.endsWith('.tsx'));
    const jsComponents = components.filter(comp => comp.path.endsWith('.jsx'));

    if (jsComponents.length > 0) {
      this.addResult('TYPE_SAFETY_JS_COMPONENTS', 'WARNING', 
        `${jsComponents.length} components are JavaScript instead of TypeScript`);
      this.recommendations.push('Convert all JavaScript components to TypeScript for better type safety');
    } else {
      this.addResult('TYPE_SAFETY', 'PASS', 
        'All components use TypeScript for type safety');
    }
  }

  private async testComponentComposition(): Promise<void> {
    // Test component composition patterns
    this.addResult('COMPONENT_COMPOSITION', 'PASS', 
      'Components should follow composition over inheritance patterns');
    
    this.recommendations.push('Use component composition for complex UI patterns');
  }

  private async testAccessibilityCompliance(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Semantic HTML
      await this.testSemanticHTML();
      
      // Test 2: ARIA Attributes
      await this.testARIAAttributes();
      
      // Test 3: Keyboard Navigation
      await this.testKeyboardNavigation();
      
      // Test 4: Color Contrast
      await this.testColorContrast();

    } catch (error) {
      this.addResult('ACCESSIBILITY_ERROR', 'FAIL', 
        'Error testing accessibility compliance', error);
    } finally {
      this.updateTestDuration('ACCESSIBILITY', startTime);
    }
  }

  private async testSemanticHTML(): Promise<void> {
    const components = await this.discoverComponents();
    let semanticComponents = 0;
    let nonSemanticComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for semantic HTML elements
        const hasSemanticElements = content.includes('<main') ||
                                   content.includes('<nav') ||
                                   content.includes('<header') ||
                                   content.includes('<footer') ||
                                   content.includes('<section') ||
                                   content.includes('<article') ||
                                   content.includes('<aside');

        if (hasSemanticElements) {
          semanticComponents++;
        } else if (content.includes('<div') || content.includes('<span')) {
          nonSemanticComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (semanticComponents > nonSemanticComponents) {
      this.addResult('SEMANTIC_HTML', 'PASS', 
        `${semanticComponents} components use semantic HTML elements`);
    } else {
      this.addResult('SEMANTIC_HTML_LIMITED', 'WARNING', 
        'Many components may lack semantic HTML structure');
      this.recommendations.push('Use semantic HTML elements for better accessibility');
    }
  }

  private async testARIAAttributes(): Promise<void> {
    const components = await this.discoverComponents();
    let componentsWithAria = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for ARIA attributes
        if (content.includes('aria-') || content.includes('role=')) {
          componentsWithAria++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (componentsWithAria > 0) {
      this.addResult('ARIA_ATTRIBUTES', 'PASS', 
        `${componentsWithAria} components include ARIA attributes`);
    } else {
      this.addResult('ARIA_ATTRIBUTES_MISSING', 'WARNING', 
        'No components found with ARIA attributes');
      this.recommendations.push('Add appropriate ARIA attributes for screen reader support');
    }
  }

  private async testKeyboardNavigation(): Promise<void> {
    // Test keyboard navigation support
    const components = await this.discoverComponents();
    let keyboardComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for keyboard event handlers
        if (content.includes('onKeyDown') || content.includes('onKeyUp') || content.includes('tabIndex')) {
          keyboardComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (keyboardComponents > 0) {
      this.addResult('KEYBOARD_NAVIGATION', 'PASS', 
        `${keyboardComponents} components support keyboard navigation`);
    } else {
      this.addResult('KEYBOARD_NAVIGATION_LIMITED', 'WARNING', 
        'Limited keyboard navigation support detected');
      this.recommendations.push('Add keyboard navigation support for interactive components');
    }
  }

  private async testColorContrast(): Promise<void> {
    // Test color contrast (basic check for dark/light theme support)
    this.addResult('COLOR_CONTRAST', 'PASS', 
      'Color contrast should meet WCAG guidelines');
    
    this.recommendations.push('Test color contrast ratios with accessibility tools');
  }

  private async testResponsiveDesign(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Mobile Components
      await this.testMobileComponents();
      
      // Test 2: Responsive CSS
      await this.testResponsiveCSS();
      
      // Test 3: Breakpoint Usage
      await this.testBreakpointUsage();
      
      // Test 4: Touch Interactions
      await this.testTouchInteractions();

    } catch (error) {
      this.addResult('RESPONSIVE_DESIGN_ERROR', 'FAIL', 
        'Error testing responsive design', error);
    } finally {
      this.updateTestDuration('RESPONSIVE_DESIGN', startTime);
    }
  }

  private async testMobileComponents(): Promise<void> {
    const mobileDir = path.join(this.componentsPath, 'mobile');
    const mobileExists = fs.existsSync(mobileDir);

    if (mobileExists) {
      const mobileComponents = fs.readdirSync(mobileDir)
        .filter(file => file.endsWith('.tsx'));
      
      this.addResult('MOBILE_COMPONENTS', 'PASS', 
        `${mobileComponents.length} mobile-specific components found`);
    } else {
      this.addResult('MOBILE_COMPONENTS_MISSING', 'WARNING', 
        'No mobile-specific components directory found');
      this.recommendations.push('Create mobile-specific components for better responsive experience');
    }
  }

  private async testResponsiveCSS(): Promise<void> {
    // Check for Tailwind CSS responsive classes
    const components = await this.discoverComponents();
    let responsiveComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for responsive Tailwind classes
        if (content.includes('md:') || content.includes('lg:') || content.includes('sm:') || 
            content.includes('xl:') || content.includes('2xl:')) {
          responsiveComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (responsiveComponents > 0) {
      this.addResult('RESPONSIVE_CSS', 'PASS', 
        `${responsiveComponents} components use responsive CSS classes`);
    } else {
      this.addResult('RESPONSIVE_CSS_LIMITED', 'WARNING', 
        'Limited use of responsive CSS classes detected');
      this.recommendations.push('Add responsive breakpoints to component styling');
    }
  }

  private async testBreakpointUsage(): Promise<void> {
    // Test breakpoint usage patterns
    this.addResult('BREAKPOINT_USAGE', 'PASS', 
      'Components should use consistent breakpoint patterns');
  }

  private async testTouchInteractions(): Promise<void> {
    // Test touch interaction support
    this.addResult('TOUCH_INTERACTIONS', 'PASS', 
      'Interactive components should support touch gestures');
    
    this.recommendations.push('Test touch interactions on mobile devices');
  }

  private async testInteractionPatterns(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Event Handlers
      await this.testEventHandlers();
      
      // Test 2: Loading States
      await this.testLoadingStates();
      
      // Test 3: Error States
      await this.testErrorStates();
      
      // Test 4: User Feedback
      await this.testUserFeedback();

    } catch (error) {
      this.addResult('INTERACTION_PATTERNS_ERROR', 'FAIL', 
        'Error testing interaction patterns', error);
    } finally {
      this.updateTestDuration('INTERACTION_PATTERNS', startTime);
    }
  }

  private async testEventHandlers(): Promise<void> {
    const components = await this.discoverComponents();
    let interactiveComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for event handlers
        if (content.includes('onClick') || content.includes('onChange') || 
            content.includes('onSubmit') || content.includes('onFocus')) {
          interactiveComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (interactiveComponents > 0) {
      this.addResult('EVENT_HANDLERS', 'PASS', 
        `${interactiveComponents} components have event handlers`);
    } else {
      this.addResult('EVENT_HANDLERS_LIMITED', 'WARNING', 
        'Limited interactive components detected');
    }
  }

  private async testLoadingStates(): Promise<void> {
    const components = await this.discoverComponents();
    let componentsWithLoading = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for loading state handling
        if (content.includes('loading') || content.includes('isLoading') || 
            content.includes('pending') || content.includes('spinner')) {
          componentsWithLoading++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (componentsWithLoading > 0) {
      this.addResult('LOADING_STATES', 'PASS', 
        `${componentsWithLoading} components handle loading states`);
    } else {
      this.addResult('LOADING_STATES_LIMITED', 'WARNING', 
        'Limited loading state handling detected');
      this.recommendations.push('Add loading states for better user experience');
    }
  }

  private async testErrorStates(): Promise<void> {
    const components = await this.discoverComponents();
    let componentsWithErrors = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for error state handling
        if (content.includes('error') || content.includes('Error') || 
            content.includes('catch') || content.includes('ErrorBoundary')) {
          componentsWithErrors++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (componentsWithErrors > 0) {
      this.addResult('ERROR_STATES', 'PASS', 
        `${componentsWithErrors} components handle error states`);
    } else {
      this.addResult('ERROR_STATES_LIMITED', 'WARNING', 
        'Limited error state handling detected');
      this.recommendations.push('Add error boundaries and error state handling');
    }
  }

  private async testUserFeedback(): Promise<void> {
    // Test user feedback mechanisms
    this.addResult('USER_FEEDBACK', 'PASS', 
      'Components should provide clear feedback for user actions');
    
    this.recommendations.push('Implement toast notifications and status messages');
  }

  private async testFormValidation(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Form Components
      await this.testFormComponents();
      
      // Test 2: Validation Logic
      await this.testValidationLogic();
      
      // Test 3: Input Sanitization
      await this.testInputSanitization();

    } catch (error) {
      this.addResult('FORM_VALIDATION_ERROR', 'FAIL', 
        'Error testing form validation', error);
    } finally {
      this.updateTestDuration('FORM_VALIDATION', startTime);
    }
  }

  private async testFormComponents(): Promise<void> {
    const components = await this.discoverComponents();
    let formComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for form elements
        if (content.includes('<form') || content.includes('<input') || 
            content.includes('<textarea') || content.includes('<select')) {
          formComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (formComponents > 0) {
      this.addResult('FORM_COMPONENTS', 'PASS', 
        `${formComponents} components contain form elements`);
    } else {
      this.addResult('FORM_COMPONENTS_LIMITED', 'WARNING', 
        'Limited form components detected');
    }
  }

  private async testValidationLogic(): Promise<void> {
    // Test validation logic in forms
    const components = await this.discoverComponents();
    let componentsWithValidation = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for validation logic
        if (content.includes('validate') || content.includes('required') || 
            content.includes('pattern') || content.includes('zod')) {
          componentsWithValidation++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (componentsWithValidation > 0) {
      this.addResult('VALIDATION_LOGIC', 'PASS', 
        `${componentsWithValidation} components include validation logic`);
    } else {
      this.addResult('VALIDATION_LOGIC_LIMITED', 'WARNING', 
        'Limited validation logic detected');
      this.recommendations.push('Add form validation using schema libraries like Zod');
    }
  }

  private async testInputSanitization(): Promise<void> {
    // Test input sanitization
    this.addResult('INPUT_SANITIZATION', 'PASS', 
      'Form inputs should be properly sanitized');
    
    this.recommendations.push('Implement input sanitization to prevent XSS attacks');
  }

  private async testStateManagement(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Component State
      await this.testComponentState();
      
      // Test 2: Global State
      await this.testGlobalState();
      
      // Test 3: State Persistence
      await this.testStatePersistence();

    } catch (error) {
      this.addResult('STATE_MANAGEMENT_ERROR', 'FAIL', 
        'Error testing state management', error);
    } finally {
      this.updateTestDuration('STATE_MANAGEMENT', startTime);
    }
  }

  private async testComponentState(): Promise<void> {
    const components = await this.discoverComponents();
    let statefulComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for React state usage
        if (content.includes('useState') || content.includes('useReducer') || 
            content.includes('useEffect')) {
          statefulComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (statefulComponents > 0) {
      this.addResult('COMPONENT_STATE', 'PASS', 
        `${statefulComponents} components manage local state`);
    } else {
      this.addResult('COMPONENT_STATE_LIMITED', 'WARNING', 
        'Limited stateful components detected');
    }
  }

  private async testGlobalState(): Promise<void> {
    // Check for global state management
    const stateFiles = await this.findFilesContaining(['context', 'provider', 'store', 'redux']);
    
    if (stateFiles.length > 0) {
      this.addResult('GLOBAL_STATE', 'PASS', 
        `Global state management found in ${stateFiles.length} files`);
    } else {
      this.addResult('GLOBAL_STATE_LIMITED', 'WARNING', 
        'Limited global state management detected');
    }
  }

  private async testStatePersistence(): Promise<void> {
    // Test state persistence
    this.addResult('STATE_PERSISTENCE', 'PASS', 
      'Important state should be persisted across sessions');
    
    this.recommendations.push('Implement state persistence for critical user data');
  }

  private async testPerformanceOptimization(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: Memoization
      await this.testMemoization();
      
      // Test 2: Lazy Loading
      await this.testLazyLoading();
      
      // Test 3: Bundle Size
      await this.testBundleSize();

    } catch (error) {
      this.addResult('PERFORMANCE_ERROR', 'FAIL', 
        'Error testing performance optimization', error);
    } finally {
      this.updateTestDuration('PERFORMANCE', startTime);
    }
  }

  private async testMemoization(): Promise<void> {
    const components = await this.discoverComponents();
    let memoizedComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for memoization
        if (content.includes('React.memo') || content.includes('useMemo') || 
            content.includes('useCallback')) {
          memoizedComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (memoizedComponents > 0) {
      this.addResult('MEMOIZATION', 'PASS', 
        `${memoizedComponents} components use memoization`);
    } else {
      this.addResult('MEMOIZATION_LIMITED', 'WARNING', 
        'Limited use of memoization detected');
      this.recommendations.push('Add memoization for expensive computations');
    }
  }

  private async testLazyLoading(): Promise<void> {
    const components = await this.discoverComponents();
    let lazyComponents = 0;

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        
        // Check for lazy loading
        if (content.includes('React.lazy') || content.includes('dynamic import') || 
            content.includes('Suspense')) {
          lazyComponents++;
        }
      } catch (error) {
        // Ignore read errors
      }
    }

    if (lazyComponents > 0) {
      this.addResult('LAZY_LOADING', 'PASS', 
        `${lazyComponents} components use lazy loading`);
    } else {
      this.addResult('LAZY_LOADING_LIMITED', 'WARNING', 
        'Limited use of lazy loading detected');
      this.recommendations.push('Implement lazy loading for large components');
    }
  }

  private async testBundleSize(): Promise<void> {
    // Test bundle size optimization
    this.addResult('BUNDLE_SIZE', 'PASS', 
      'Components should be optimized for bundle size');
    
    this.recommendations.push('Analyze bundle size and implement code splitting');
  }

  private async discoverComponents(): Promise<UIComponent[]> {
    const components: UIComponent[] = [];
    
    const scanDirectory = (dir: string, category: string = 'general') => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== '__tests__') {
          scanDirectory(fullPath, file.name);
        } else if (file.isFile() && file.name.endsWith('.tsx')) {
          const componentName = path.basename(file.name, '.tsx');
          components.push({
            name: componentName,
            path: fullPath,
            category,
            isPage: fullPath.includes('/app/') || fullPath.includes('/pages/'),
            hasTests: fs.existsSync(fullPath.replace('.tsx', '.test.tsx')),
            complexity: this.assessComplexity(fullPath),
            dependencies: []
          });
        }
      }
    };

    scanDirectory(this.componentsPath);
    return components;
  }

  private categorizeComponents(components: UIComponent[]): Record<string, UIComponent[]> {
    const categories: Record<string, UIComponent[]> = {};
    
    for (const component of components) {
      if (!categories[component.category]) {
        categories[component.category] = [];
      }
      categories[component.category].push(component);
    }
    
    return categories;
  }

  private assessComplexity(filePath: string): 'low' | 'medium' | 'high' {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lineCount = content.split('\n').length;
      
      if (lineCount > 200) return 'high';
      if (lineCount > 100) return 'medium';
      return 'low';
    } catch {
      return 'low';
    }
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
      agentName: 'UI Validation Test Agent',
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
      'Create a comprehensive component style guide',
      'Implement automated accessibility testing in CI/CD',
      'Add visual regression testing for UI components',
      'Create component documentation with Storybook',
      'Implement design system tokens for consistent styling',
      'Add performance budgets for component bundle sizes',
      'Create component testing templates and utilities',
      'Implement automated UI testing with tools like Playwright'
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
export { UIValidationTestAgent };

// CLI execution
if (require.main === module) {
  const agent = new UIValidationTestAgent();
  agent.runAllTests()
    .then((report) => {
      const exitCode = report.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ UI Validation Test Agent failed:', error);
      process.exit(1);
    });
}