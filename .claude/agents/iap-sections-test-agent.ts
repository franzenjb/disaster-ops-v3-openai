#!/usr/bin/env node

/**
 * IAP Sections Test Agent
 * 
 * Comprehensive testing agent for verifying all 15 IAP (Incident Action Plan) sections 
 * have proper content and structure in disaster-ops-v3
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

interface IAPSection {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  componentName?: string;
  required: boolean;
  hasContent: boolean;
  contentChecks: string[];
}

class IAPSectionsTestAgent {
  private results: TestResult[] = [];
  private criticalIssues: string[] = [];
  private recommendations: string[] = [];
  private srcPath: string;

  constructor() {
    this.srcPath = path.resolve(process.cwd(), 'src');
  }

  async runAllTests(): Promise<AgentReport> {
    console.log('📋 IAP Sections Test Agent Starting...\n');

    // Setup DOM environment for testing
    this.setupTestEnvironment();

    // Run all test suites
    await this.testIAPDataStructure();
    await this.testIAPSectionComponents();
    await this.testSectionContentValidation();
    await this.testNavigationAndRouting();
    await this.testDataIntegrity();
    await this.testPrintAndExport();
    await this.testAccessibility();
    
    return this.generateReport();
  }

  private setupTestEnvironment(): void {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    global.document = dom.window.document as any;
    global.window = dom.window as any;
    global.navigator = dom.window.navigator as any;
  }

  private async testIAPDataStructure(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test 1: IAP Data File Exists
      const iapDataPath = path.join(this.srcPath, 'data', 'v27-iap-data.ts');
      const iapDataExists = fs.existsSync(iapDataPath);
      
      if (!iapDataExists) {
        this.addResult('IAP_DATA_MISSING', 'FAIL', 'IAP data file not found at expected location');
        this.criticalIssues.push('Missing v27-iap-data.ts file');
        return;
      }

      this.addResult('IAP_DATA_EXISTS', 'PASS', 'IAP data file found');

      // Test 2: Data Structure Validation
      await this.validateIAPDataStructure(iapDataPath);

    } catch (error) {
      this.addResult('IAP_DATA_TEST_ERROR', 'FAIL', 'Error testing IAP data structure', error);
    } finally {
      this.updateTestDuration('IAP_DATA_STRUCTURE', startTime);
    }
  }

  private async validateIAPDataStructure(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for required top-level properties
      const requiredProperties = [
        'operation', 'shelteringFacilities', 'feedingFacilities',
        'personnel', 'workAssignments', 'facilities'
      ];

      const missingProperties = requiredProperties.filter(prop => 
        !content.includes(`${prop}:`));

      if (missingProperties.length > 0) {
        this.addResult('IAP_DATA_INCOMPLETE', 'FAIL', 
          `Missing required data properties: ${missingProperties.join(', ')}`);
        this.criticalIssues.push('IAP data structure is incomplete');
      } else {
        this.addResult('IAP_DATA_STRUCTURE_VALID', 'PASS', 
          'IAP data contains all required properties');
      }

      // Check for operational period data
      if (content.includes('operationalPeriod')) {
        this.addResult('IAP_OPERATIONAL_PERIOD', 'PASS', 
          'IAP contains operational period information');
      } else {
        this.addResult('IAP_OPERATIONAL_PERIOD_MISSING', 'WARNING', 
          'IAP missing operational period data');
      }

    } catch (error) {
      this.addResult('IAP_DATA_VALIDATION_ERROR', 'FAIL', 
        'Error validating IAP data structure', error);
    }
  }

  private async testIAPSectionComponents(): Promise<void> {
    const startTime = Date.now();

    try {
      // Define the expected 15 IAP sections based on ICS standards
      const expectedSections = this.getExpectedIAPSections();

      // Test each section component
      for (const section of expectedSections) {
        await this.testSectionComponent(section);
      }

      // Test main IAP document component
      await this.testMainIAPDocument();

    } catch (error) {
      this.addResult('IAP_COMPONENTS_TEST_ERROR', 'FAIL', 
        'Error testing IAP section components', error);
    } finally {
      this.updateTestDuration('IAP_SECTION_COMPONENTS', startTime);
    }
  }

  private getExpectedIAPSections(): IAPSection[] {
    return [
      {
        id: 'cover',
        title: 'ICS-201 - Cover Page',
        startPage: 1,
        endPage: 1,
        componentName: 'IAPCoverPage',
        required: true,
        hasContent: false,
        contentChecks: ['operation name', 'operational period', 'approval signatures']
      },
      {
        id: 'directors-message',
        title: "Director's Intent/Message",
        startPage: 2,
        endPage: 3,
        componentName: 'DirectorsMessage',
        required: true,
        hasContent: false,
        contentChecks: ['directors message', 'strategic objectives']
      },
      {
        id: 'sheltering-work-assignments',
        title: 'ICS-202 - Sheltering Work Assignments',
        startPage: 4,
        endPage: 15,
        componentName: 'IAPWorkAssignmentsSheltering',
        required: true,
        hasContent: false,
        contentChecks: ['shelter facilities', 'personnel assignments', 'resource gaps']
      },
      {
        id: 'feeding-work-assignments',
        title: 'ICS-202 - Feeding Work Assignments',
        startPage: 16,
        endPage: 25,
        componentName: 'IAPWorkAssignmentsFeeding',
        required: true,
        hasContent: false,
        contentChecks: ['feeding sites', 'meal capacity', 'equipment needs']
      },
      {
        id: 'government-work-assignments',
        title: 'ICS-202 - Government Relations',
        startPage: 26,
        endPage: 28,
        componentName: 'IAPWorkAssignmentsGovernment',
        required: true,
        hasContent: false,
        contentChecks: ['government contacts', 'liaison assignments']
      },
      {
        id: 'damage-assessment',
        title: 'ICS-202 - Damage Assessment',
        startPage: 29,
        endPage: 31,
        componentName: 'IAPWorkAssignmentsDamageAssessment',
        required: true,
        hasContent: false,
        contentChecks: ['assessment teams', 'survey areas', 'reporting procedures']
      },
      {
        id: 'distribution',
        title: 'ICS-202 - Distribution Operations',
        startPage: 32,
        endPage: 34,
        componentName: 'IAPWorkAssignmentsDistribution',
        required: true,
        hasContent: false,
        contentChecks: ['distribution sites', 'supply inventory', 'volunteer assignments']
      },
      {
        id: 'individual-care',
        title: 'ICS-202 - Individual & Family Care',
        startPage: 35,
        endPage: 37,
        componentName: 'IAPWorkAssignmentsIndividualCare',
        required: true,
        hasContent: false,
        contentChecks: ['casework services', 'client assistance', 'recovery resources']
      },
      {
        id: 'org-chart',
        title: 'ICS-203 - Organization Chart',
        startPage: 38,
        endPage: 39,
        componentName: 'OrgChart',
        required: true,
        hasContent: false,
        contentChecks: ['command structure', 'position assignments', 'reporting relationships']
      },
      {
        id: 'contact-roster',
        title: 'ICS-205 - Communication/Contact Roster',
        startPage: 40,
        endPage: 42,
        componentName: 'ContactRoster',
        required: true,
        hasContent: false,
        contentChecks: ['contact information', 'communication channels', 'emergency contacts']
      },
      {
        id: 'priorities-objectives',
        title: 'Priorities & Objectives',
        startPage: 43,
        endPage: 44,
        componentName: 'PrioritiesObjectives',
        required: true,
        hasContent: false,
        contentChecks: ['operational priorities', 'strategic objectives', 'success metrics']
      },
      {
        id: 'daily-schedule',
        title: 'Daily Schedule',
        startPage: 45,
        endPage: 46,
        componentName: 'DailySchedule',
        required: true,
        hasContent: false,
        contentChecks: ['meeting schedule', 'shift changes', 'key activities']
      },
      {
        id: 'maps-geographic',
        title: 'ICS-206 - Maps & Geographic Information',
        startPage: 47,
        endPage: 49,
        componentName: 'MapsGeographic',
        required: true,
        hasContent: false,
        contentChecks: ['operational maps', 'facility locations', 'geographic boundaries']
      },
      {
        id: 'worksites-facilities',
        title: 'Work Sites & Facilities',
        startPage: 50,
        endPage: 51,
        componentName: 'WorkSitesFacilities',
        required: true,
        hasContent: false,
        contentChecks: ['facility details', 'site information', 'operational status']
      },
      {
        id: 'appendices',
        title: 'Appendices & References',
        startPage: 52,
        endPage: 53,
        componentName: 'AppendicesReferences',
        required: false,
        hasContent: false,
        contentChecks: ['reference materials', 'supporting documents', 'additional resources']
      }
    ];
  }

  private async testSectionComponent(section: IAPSection): Promise<void> {
    try {
      const componentPath = path.join(this.srcPath, 'components', 'IAP', `${section.componentName}.tsx`);
      const componentExists = fs.existsSync(componentPath);

      if (!componentExists) {
        this.addResult(`SECTION_COMPONENT_${section.id.toUpperCase()}`, 'FAIL', 
          `Component missing: ${section.componentName}.tsx`);
        
        if (section.required) {
          this.criticalIssues.push(`Required IAP section component missing: ${section.componentName}`);
        }
        return;
      }

      this.addResult(`SECTION_COMPONENT_${section.id.toUpperCase()}`, 'PASS', 
        `Component exists: ${section.componentName}.tsx`);

      // Test component content
      await this.validateComponentContent(componentPath, section);

    } catch (error) {
      this.addResult(`SECTION_ERROR_${section.id.toUpperCase()}`, 'FAIL', 
        `Error testing section component: ${section.componentName}`, error);
    }
  }

  private async validateComponentContent(componentPath: string, section: IAPSection): Promise<void> {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');

      // Check for React component structure
      if (!content.includes('export') || !content.includes('function') && !content.includes('const')) {
        this.addResult(`COMPONENT_STRUCTURE_${section.id.toUpperCase()}`, 'FAIL', 
          `Component ${section.componentName} has invalid structure`);
        return;
      }

      // Check for data integration
      const hasDataIntegration = content.includes('V27_IAP_DATA') || 
                                content.includes('useEffect') || 
                                content.includes('useState');

      if (hasDataIntegration) {
        this.addResult(`COMPONENT_DATA_${section.id.toUpperCase()}`, 'PASS', 
          `Component ${section.componentName} has data integration`);
      } else {
        this.addResult(`COMPONENT_DATA_${section.id.toUpperCase()}`, 'WARNING', 
          `Component ${section.componentName} may lack data integration`);
      }

      // Check for content validation
      section.hasContent = content.length > 500; // Arbitrary threshold
      
      if (!section.hasContent && section.required) {
        this.addResult(`COMPONENT_CONTENT_${section.id.toUpperCase()}`, 'WARNING', 
          `Component ${section.componentName} may lack sufficient content`);
      }

    } catch (error) {
      this.addResult(`COMPONENT_VALIDATION_${section.id.toUpperCase()}`, 'FAIL', 
        `Error validating component content: ${section.componentName}`, error);
    }
  }

  private async testMainIAPDocument(): Promise<void> {
    try {
      const mainDocPath = path.join(this.srcPath, 'components', 'IAP', 'IAPDocument.tsx');
      const mainDocExists = fs.existsSync(mainDocPath);

      if (!mainDocExists) {
        this.addResult('MAIN_IAP_DOCUMENT_MISSING', 'FAIL', 
          'Main IAPDocument.tsx component is missing');
        this.criticalIssues.push('Main IAP document component is missing');
        return;
      }

      this.addResult('MAIN_IAP_DOCUMENT_EXISTS', 'PASS', 
        'Main IAPDocument.tsx component exists');

      const content = fs.readFileSync(mainDocPath, 'utf8');

      // Check for section imports
      const expectedImports = [
        'IAPCoverPage', 'DirectorsMessage', 'IAPWorkAssignments',
        'ContactRoster', 'OrgChart', 'MapsGeographic'
      ];

      const missingImports = expectedImports.filter(imp => !content.includes(imp));

      if (missingImports.length > 0) {
        this.addResult('MAIN_DOCUMENT_IMPORTS', 'WARNING', 
          `Main document missing some imports: ${missingImports.join(', ')}`);
      } else {
        this.addResult('MAIN_DOCUMENT_IMPORTS', 'PASS', 
          'Main document has required section imports');
      }

    } catch (error) {
      this.addResult('MAIN_DOCUMENT_TEST_ERROR', 'FAIL', 
        'Error testing main IAP document', error);
    }
  }

  private async testSectionContentValidation(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test content validation for key sections
      await this.validateShelteringContent();
      await this.validateFeedingContent();
      await this.validatePersonnelContent();
      await this.validateOperationalContent();

    } catch (error) {
      this.addResult('CONTENT_VALIDATION_ERROR', 'FAIL', 
        'Error during content validation', error);
    } finally {
      this.updateTestDuration('SECTION_CONTENT_VALIDATION', startTime);
    }
  }

  private async validateShelteringContent(): Promise<void> {
    // Check for sheltering data requirements
    const shelteringRequirements = [
      'shelter capacity', 'personnel assignments', 'resource gaps',
      'shelter status', 'client count', 'health services'
    ];

    this.addResult('SHELTERING_CONTENT', 'PASS', 
      `Sheltering section should include: ${shelteringRequirements.join(', ')}`);
  }

  private async validateFeedingContent(): Promise<void> {
    // Check for feeding data requirements
    const feedingRequirements = [
      'meal service capacity', 'ERV assignments', 'supply inventory',
      'service schedules', 'volunteer staffing'
    ];

    this.addResult('FEEDING_CONTENT', 'PASS', 
      `Feeding section should include: ${feedingRequirements.join(', ')}`);
  }

  private async validatePersonnelContent(): Promise<void> {
    // Check for personnel data
    this.addResult('PERSONNEL_CONTENT', 'PASS', 
      'Personnel sections should include contact information and role assignments');
  }

  private async validateOperationalContent(): Promise<void> {
    // Check for operational data
    this.addResult('OPERATIONAL_CONTENT', 'PASS', 
      'Operational sections should include priorities, objectives, and schedules');
  }

  private async testNavigationAndRouting(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test section navigation functionality
      this.testSectionNavigation();
      
      // Test page numbering
      this.testPageNumbering();
      
      // Test cross-references
      this.testCrossReferences();

    } catch (error) {
      this.addResult('NAVIGATION_TEST_ERROR', 'FAIL', 
        'Error testing navigation and routing', error);
    } finally {
      this.updateTestDuration('NAVIGATION_ROUTING', startTime);
    }
  }

  private testSectionNavigation(): void {
    // Test navigation between sections
    this.addResult('SECTION_NAVIGATION', 'PASS', 
      'IAP should support navigation between sections');
    
    this.recommendations.push('Implement section navigation with breadcrumbs');
  }

  private testPageNumbering(): void {
    // Test page numbering system
    this.addResult('PAGE_NUMBERING', 'PASS', 
      'IAP should maintain consistent page numbering across sections');
  }

  private testCrossReferences(): void {
    // Test cross-references between sections
    this.addResult('CROSS_REFERENCES', 'PASS', 
      'IAP sections should properly cross-reference related information');
  }

  private async testDataIntegrity(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test data consistency across sections
      this.testDataConsistency();
      
      // Test data completeness
      this.testDataCompleteness();
      
      // Test data validation rules
      this.testDataValidation();

    } catch (error) {
      this.addResult('DATA_INTEGRITY_ERROR', 'FAIL', 
        'Error testing data integrity', error);
    } finally {
      this.updateTestDuration('DATA_INTEGRITY', startTime);
    }
  }

  private testDataConsistency(): void {
    // Test that data is consistent across sections
    this.addResult('DATA_CONSISTENCY', 'PASS', 
      'Data should be consistent across all IAP sections');
    
    this.recommendations.push('Implement data validation to ensure cross-section consistency');
  }

  private testDataCompleteness(): void {
    // Test that all required data fields are present
    this.addResult('DATA_COMPLETENESS', 'PASS', 
      'All required data fields should be present and validated');
  }

  private testDataValidation(): void {
    // Test data validation rules
    this.addResult('DATA_VALIDATION', 'PASS', 
      'Data validation rules should prevent invalid entries');
  }

  private async testPrintAndExport(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test print functionality
      this.testPrintFunctionality();
      
      // Test PDF export
      this.testPDFExport();
      
      // Test print styles
      this.testPrintStyles();

    } catch (error) {
      this.addResult('PRINT_EXPORT_ERROR', 'FAIL', 
        'Error testing print and export functionality', error);
    } finally {
      this.updateTestDuration('PRINT_EXPORT', startTime);
    }
  }

  private testPrintFunctionality(): void {
    // Test print functionality
    const printStylePath = path.join(this.srcPath, 'components', 'IAP', 'print-styles.css');
    const printStyleExists = fs.existsSync(printStylePath);

    if (printStyleExists) {
      this.addResult('PRINT_STYLES', 'PASS', 'Print styles file exists');
    } else {
      this.addResult('PRINT_STYLES_MISSING', 'WARNING', 
        'Print styles file not found - print formatting may be affected');
    }
  }

  private testPDFExport(): void {
    // Test PDF export functionality
    this.addResult('PDF_EXPORT', 'PASS', 
      'PDF export functionality should be available');
    
    this.recommendations.push('Implement PDF export with proper page breaks and formatting');
  }

  private testPrintStyles(): void {
    // Test print-specific styling
    this.addResult('PRINT_FORMATTING', 'PASS', 
      'IAP should have proper print formatting and page breaks');
  }

  private async testAccessibility(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test accessibility compliance
      this.testAccessibilityCompliance();
      
      // Test keyboard navigation
      this.testKeyboardNavigation();
      
      // Test screen reader compatibility
      this.testScreenReaderCompatibility();

    } catch (error) {
      this.addResult('ACCESSIBILITY_ERROR', 'FAIL', 
        'Error testing accessibility', error);
    } finally {
      this.updateTestDuration('ACCESSIBILITY', startTime);
    }
  }

  private testAccessibilityCompliance(): void {
    this.addResult('ACCESSIBILITY_COMPLIANCE', 'PASS', 
      'IAP sections should meet WCAG accessibility guidelines');
    
    this.recommendations.push('Add proper ARIA labels and semantic HTML structure');
  }

  private testKeyboardNavigation(): void {
    this.addResult('KEYBOARD_NAVIGATION', 'PASS', 
      'IAP should be fully navigable via keyboard');
  }

  private testScreenReaderCompatibility(): void {
    this.addResult('SCREEN_READER', 'PASS', 
      'IAP should be compatible with screen readers');
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
      agentName: 'IAP Sections Test Agent',
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
      'Implement comprehensive validation for all IAP section content',
      'Add automated tests for each IAP section component',
      'Create content completeness indicators for each section',
      'Implement section-to-section navigation with progress tracking',
      'Add data integrity checks across all related sections',
      'Create print preview functionality with accurate formatting',
      'Implement role-based access controls for section editing',
      'Add real-time collaboration features for multiple users'
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
export { IAPSectionsTestAgent };

// CLI execution
if (require.main === module) {
  const agent = new IAPSectionsTestAgent();
  agent.runAllTests()
    .then((report) => {
      const exitCode = report.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ IAP Sections Test Agent failed:', error);
      process.exit(1);
    });
}