#!/usr/bin/env node

/**
 * Master Test Agent
 * 
 * Coordinates and runs all specialized testing agents for disaster-ops-v3
 * Provides comprehensive testing coverage and consolidated reporting
 */

import { GoogleMapsTestAgent } from './google-maps-test-agent';
import { IAPSectionsTestAgent } from './iap-sections-test-agent';
import { DataSyncTestAgent } from './data-sync-test-agent';
import { UIValidationTestAgent } from './ui-validation-agent';
import { APIIntegrationTestAgent } from './api-integration-test-agent';

interface AgentReport {
  agentName: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  results: Array<{
    testName: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
    details?: any;
    duration?: number;
  }>;
  criticalIssues: string[];
  recommendations: string[];
}

interface MasterReport {
  masterAgentName: string;
  timestamp: string;
  totalAgents: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalWarnings: number;
  agentReports: AgentReport[];
  consolidatedIssues: string[];
  consolidatedRecommendations: string[];
  testCoverage: {
    googleMaps: boolean;
    iapSections: boolean;
    dataSync: boolean;
    uiValidation: boolean;
    apiIntegration: boolean;
  };
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
}

class MasterTestAgent {
  private agents: Array<{
    name: string;
    instance: any;
    enabled: boolean;
  }>;

  constructor() {
    this.agents = [
      {
        name: 'Google Maps API Integration',
        instance: new GoogleMapsTestAgent(),
        enabled: true
      },
      {
        name: 'IAP Sections Validation',
        instance: new IAPSectionsTestAgent(),
        enabled: true
      },
      {
        name: 'Data Synchronization',
        instance: new DataSyncTestAgent(),
        enabled: true
      },
      {
        name: 'UI Component Validation',
        instance: new UIValidationTestAgent(),
        enabled: true
      },
      {
        name: 'API Integration',
        instance: new APIIntegrationTestAgent(),
        enabled: true
      }
    ];
  }

  async runAllAgents(options: {
    parallel?: boolean;
    continueOnFailure?: boolean;
    skipAgents?: string[];
  } = {}): Promise<MasterReport> {
    console.log('🚀 Master Test Agent Starting...\n');
    console.log(`Running ${this.agents.length} specialized testing agents...\n`);

    const {
      parallel = true,
      continueOnFailure = true,
      skipAgents = []
    } = options;

    // Filter agents based on skip list
    const activeAgents = this.agents.filter(agent => 
      agent.enabled && !skipAgents.includes(agent.name));

    console.log(`Active agents: ${activeAgents.length}/${this.agents.length}\n`);

    const agentReports: AgentReport[] = [];
    let hasFailures = false;

    if (parallel) {
      // Run agents in parallel
      console.log('🔄 Running agents in parallel...\n');
      
      const promises = activeAgents.map(async (agent) => {
        try {
          console.log(`▶️  Starting ${agent.name} Agent...`);
          const report = await agent.instance.runAllTests();
          console.log(`✅ ${agent.name} Agent completed`);
          return report;
        } catch (error) {
          console.error(`❌ ${agent.name} Agent failed:`, error);
          hasFailures = true;
          
          // Create error report
          return {
            agentName: agent.name,
            timestamp: new Date().toISOString(),
            totalTests: 0,
            passed: 0,
            failed: 1,
            warnings: 0,
            results: [{
              testName: 'AGENT_EXECUTION',
              status: 'FAIL' as const,
              message: `Agent failed to execute: ${error.message}`,
              details: error
            }],
            criticalIssues: [`${agent.name} agent failed to execute`],
            recommendations: [`Fix ${agent.name} agent execution issues`]
          } as AgentReport;
        }
      });

      const reports = await Promise.allSettled(promises);
      
      reports.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          agentReports.push(result.value);
        } else {
          console.error(`Agent ${activeAgents[index].name} promise rejected:`, result.reason);
          hasFailures = true;
        }
      });

    } else {
      // Run agents sequentially
      console.log('🔄 Running agents sequentially...\n');
      
      for (const agent of activeAgents) {
        try {
          console.log(`▶️  Starting ${agent.name} Agent...`);
          const report = await agent.instance.runAllTests();
          console.log(`✅ ${agent.name} Agent completed\n`);
          
          agentReports.push(report);
          
          if (report.failed > 0) {
            hasFailures = true;
            if (!continueOnFailure) {
              console.log(`❌ Stopping execution due to failures in ${agent.name} Agent`);
              break;
            }
          }
          
        } catch (error) {
          console.error(`❌ ${agent.name} Agent failed:`, error);
          hasFailures = true;
          
          if (!continueOnFailure) {
            console.log(`❌ Stopping execution due to error in ${agent.name} Agent`);
            break;
          }
        }
      }
    }

    // Generate master report
    const masterReport = this.generateMasterReport(agentReports);
    
    // Print master report
    this.printMasterReport(masterReport);
    
    return masterReport;
  }

  private generateMasterReport(agentReports: AgentReport[]): MasterReport {
    const totalTests = agentReports.reduce((sum, report) => sum + report.totalTests, 0);
    const totalPassed = agentReports.reduce((sum, report) => sum + report.passed, 0);
    const totalFailed = agentReports.reduce((sum, report) => sum + report.failed, 0);
    const totalWarnings = agentReports.reduce((sum, report) => sum + report.warnings, 0);

    // Consolidate critical issues
    const allIssues = agentReports.flatMap(report => report.criticalIssues);
    const consolidatedIssues = [...new Set(allIssues)];

    // Consolidate recommendations
    const allRecommendations = agentReports.flatMap(report => report.recommendations);
    const consolidatedRecommendations = [...new Set(allRecommendations)];

    // Determine overall status
    let overallStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (totalFailed > 0) {
      overallStatus = 'FAIL';
    } else if (totalWarnings > 0) {
      overallStatus = 'WARNING';
    }

    // Test coverage
    const testCoverage = {
      googleMaps: agentReports.some(r => r.agentName.includes('Google Maps')),
      iapSections: agentReports.some(r => r.agentName.includes('IAP')),
      dataSync: agentReports.some(r => r.agentName.includes('Data Sync')),
      uiValidation: agentReports.some(r => r.agentName.includes('UI')),
      apiIntegration: agentReports.some(r => r.agentName.includes('API'))
    };

    return {
      masterAgentName: 'Master Test Agent',
      timestamp: new Date().toISOString(),
      totalAgents: agentReports.length,
      totalTests,
      totalPassed,
      totalFailed,
      totalWarnings,
      agentReports,
      consolidatedIssues,
      consolidatedRecommendations,
      testCoverage,
      overallStatus
    };
  }

  private printMasterReport(report: MasterReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MASTER TEST AGENT REPORT');
    console.log('='.repeat(80));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Agents Run: ${report.totalAgents}`);
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Total Passed: ${report.totalPassed}`);
    console.log(`❌ Total Failed: ${report.totalFailed}`);
    console.log(`⚠️  Total Warnings: ${report.totalWarnings}`);
    console.log(`📈 Overall Status: ${this.getStatusIcon(report.overallStatus)} ${report.overallStatus}`);
    console.log('');

    // Test Coverage Summary
    console.log('🎯 Test Coverage:');
    Object.entries(report.testCoverage).forEach(([area, covered]) => {
      const icon = covered ? '✅' : '❌';
      const areaName = area.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${icon} ${areaName}`);
    });
    console.log('');

    // Agent Summary
    console.log('🤖 Agent Results Summary:');
    report.agentReports.forEach((agentReport, index) => {
      const statusIcon = this.getStatusIcon(
        agentReport.failed > 0 ? 'FAIL' : 
        agentReport.warnings > 0 ? 'WARNING' : 'PASS'
      );
      
      console.log(`${index + 1}. ${statusIcon} ${agentReport.agentName}`);
      console.log(`   Tests: ${agentReport.totalTests} | ` +
                 `Passed: ${agentReport.passed} | ` +
                 `Failed: ${agentReport.failed} | ` +
                 `Warnings: ${agentReport.warnings}`);
      
      if (agentReport.criticalIssues.length > 0) {
        console.log(`   Critical Issues: ${agentReport.criticalIssues.length}`);
      }
    });
    console.log('');

    // Consolidated Critical Issues
    if (report.consolidatedIssues.length > 0) {
      console.log('🚨 CONSOLIDATED CRITICAL ISSUES:');
      report.consolidatedIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log('');
    }

    // Top Priority Recommendations
    if (report.consolidatedRecommendations.length > 0) {
      console.log('💡 TOP PRIORITY RECOMMENDATIONS:');
      const topRecommendations = report.consolidatedRecommendations.slice(0, 10);
      topRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      
      if (report.consolidatedRecommendations.length > 10) {
        console.log(`... and ${report.consolidatedRecommendations.length - 10} more recommendations`);
      }
      console.log('');
    }

    // Next Steps
    console.log('🎯 NEXT STEPS:');
    if (report.totalFailed > 0) {
      console.log('1. Address critical failures immediately');
      console.log('2. Fix configuration issues');
      console.log('3. Re-run failed tests');
    }
    if (report.totalWarnings > 0) {
      console.log('1. Review warnings and plan improvements');
      console.log('2. Implement recommended enhancements');
    }
    if (report.totalFailed === 0 && report.totalWarnings === 0) {
      console.log('1. System is healthy - continue monitoring');
      console.log('2. Consider implementing recommended enhancements');
      console.log('3. Set up automated testing in CI/CD pipeline');
    }

    console.log('');
    console.log('='.repeat(80));
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'WARNING': return '⚠️';
      default: return '❓';
    }
  }

  async runSpecificAgent(agentName: string): Promise<AgentReport | null> {
    const agent = this.agents.find(a => 
      a.name.toLowerCase().includes(agentName.toLowerCase()) ||
      agentName.toLowerCase().includes(a.name.toLowerCase())
    );

    if (!agent) {
      console.error(`❌ Agent not found: ${agentName}`);
      console.log('Available agents:');
      this.agents.forEach(a => console.log(`  - ${a.name}`));
      return null;
    }

    console.log(`🚀 Running ${agent.name} Agent...\n`);
    
    try {
      const report = await agent.instance.runAllTests();
      console.log(`✅ ${agent.name} Agent completed successfully`);
      return report;
    } catch (error) {
      console.error(`❌ ${agent.name} Agent failed:`, error);
      return null;
    }
  }

  listAgents(): void {
    console.log('🤖 Available Testing Agents:');
    console.log('='.repeat(40));
    
    this.agents.forEach((agent, index) => {
      const status = agent.enabled ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${agent.name}`);
    });
    
    console.log('');
    console.log('Usage Examples:');
    console.log('  npm run test:agents                  # Run all agents');
    console.log('  npm run test:agents -- --agent maps  # Run specific agent');
    console.log('  npm run test:agents -- --sequential  # Run sequentially');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const masterAgent = new MasterTestAgent();

  // Parse command line arguments
  const options = {
    parallel: !args.includes('--sequential'),
    continueOnFailure: !args.includes('--fail-fast'),
    skipAgents: [] as string[],
    specificAgent: null as string | null,
    listAgents: args.includes('--list') || args.includes('-l')
  };

  // Check for specific agent
  const agentIndex = args.indexOf('--agent');
  if (agentIndex !== -1 && args[agentIndex + 1]) {
    options.specificAgent = args[agentIndex + 1];
  }

  // Check for skip agents
  const skipIndex = args.indexOf('--skip');
  if (skipIndex !== -1 && args[skipIndex + 1]) {
    options.skipAgents = args[skipIndex + 1].split(',');
  }

  try {
    if (options.listAgents) {
      masterAgent.listAgents();
      return;
    }

    if (options.specificAgent) {
      const report = await masterAgent.runSpecificAgent(options.specificAgent);
      const exitCode = report && report.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    } else {
      const report = await masterAgent.runAllAgents(options);
      const exitCode = report.totalFailed > 0 ? 1 : 0;
      process.exit(exitCode);
    }
  } catch (error) {
    console.error('❌ Master Test Agent failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { MasterTestAgent };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}