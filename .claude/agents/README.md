# Testing Agent System

This directory contains a comprehensive testing agent system for the disaster-ops-v3 application. Each agent specializes in testing specific aspects of the system and provides detailed reports on functionality, issues, and recommendations.

## 🤖 Available Testing Agents

### 1. Google Maps Test Agent (`google-maps-test-agent.ts`)
**Tests Google Maps API integration and functionality**

- ✅ API key configuration and validation
- ✅ Google Maps loader implementation 
- ✅ Map components functionality
- ✅ Places Autocomplete integration
- ✅ Error handling and fallbacks
- ✅ Performance optimization
- ✅ Security configuration

**Usage:**
```bash
npx ts-node .claude/agents/google-maps-test-agent.ts
```

### 2. IAP Sections Test Agent (`iap-sections-test-agent.ts`)
**Validates all 15 IAP (Incident Action Plan) sections**

- ✅ IAP data structure validation
- ✅ Section component verification (Cover Page, Director's Message, Work Assignments, etc.)
- ✅ Content validation for all sections
- ✅ Navigation and routing
- ✅ Data integrity across sections
- ✅ Print and export functionality
- ✅ Accessibility compliance

**Usage:**
```bash
npx ts-node .claude/agents/iap-sections-test-agent.ts
```

### 3. Data Sync Test Agent (`data-sync-test-agent.ts`)
**Tests data synchronization between components**

- ✅ Sync engine architecture
- ✅ Data migration system
- ✅ Real-time synchronization
- ✅ Cross-component consistency
- ✅ Conflict resolution
- ✅ Offline handling
- ✅ Performance and scaling
- ✅ Data integrity

**Usage:**
```bash
npx ts-node .claude/agents/data-sync-test-agent.ts
```

### 4. UI Validation Agent (`ui-validation-agent.ts`)
**Validates UI components and user interfaces**

- ✅ Component structure and organization
- ✅ Component integration and props
- ✅ Accessibility compliance (WCAG)
- ✅ Responsive design
- ✅ Interaction patterns
- ✅ Form validation
- ✅ State management
- ✅ Performance optimization

**Usage:**
```bash
npx ts-node .claude/agents/ui-validation-agent.ts
```

### 5. API Integration Test Agent (`api-integration-test-agent.ts`)
**Tests all API integrations and external services**

- ✅ Supabase integration (database, auth, realtime)
- ✅ Google Maps API integration
- ✅ Authentication systems
- ✅ Database connections
- ✅ External service integrations
- ✅ API error handling
- ✅ Rate limiting
- ✅ Data validation

**Usage:**
```bash
npx ts-node .claude/agents/api-integration-test-agent.ts
```

### 6. Master Test Agent (`master-test-agent.ts`)
**Coordinates and runs all testing agents**

- 🚀 Runs all agents in parallel or sequential mode
- 📊 Consolidates reports from all agents
- 🎯 Provides comprehensive test coverage analysis
- 💡 Prioritizes recommendations
- 🔍 Identifies critical issues across the system

**Usage:**
```bash
# Run all agents
npx ts-node .claude/agents/master-test-agent.ts

# Run specific agent
npx ts-node .claude/agents/master-test-agent.ts --agent maps

# Run agents sequentially
npx ts-node .claude/agents/master-test-agent.ts --sequential

# List available agents
npx ts-node .claude/agents/master-test-agent.ts --list
```

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:agents
```

### Run Specific Agent
```bash
npm run test:agents -- --agent maps     # Google Maps tests
npm run test:agents -- --agent iap      # IAP sections tests
npm run test:agents -- --agent sync     # Data sync tests
npm run test:agents -- --agent ui       # UI validation tests
npm run test:agents -- --agent api      # API integration tests
```

### Advanced Usage
```bash
# Run agents sequentially (instead of parallel)
npm run test:agents -- --sequential

# Skip specific agents
npm run test:agents -- --skip "Google Maps,UI Validation"

# Stop on first failure
npm run test:agents -- --fail-fast

# List all available agents
npm run test:agents -- --list
```

## 📊 Report Format

Each agent generates a detailed report with:

- **Test Results**: Pass/Fail/Warning status for each test
- **Critical Issues**: Problems that need immediate attention
- **Recommendations**: Suggested improvements and best practices
- **Execution Time**: Performance metrics for each test suite
- **Detailed Information**: Contextual data and configuration details

### Example Report Structure
```
📊 [Agent Name] Report
==================================================
Timestamp: 2025-01-07T10:30:00.000Z
Total Tests: 25
✅ Passed: 20
❌ Failed: 3
⚠️  Warnings: 2

🚨 Critical Issues:
1. Missing API key configuration
2. Database connection failed

📋 Test Results:
✅ API_KEY_CONFIGURED: Google Maps API key properly configured
❌ DATABASE_CONNECTION: Failed to connect to database
⚠️  ERROR_HANDLING: Limited error handling detected

💡 Recommendations:
1. Add comprehensive error boundaries
2. Implement retry logic for API calls
3. Add monitoring and alerting
```

## 🔧 Configuration

### Environment Variables Required
```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Adding Custom Agents

1. Create a new agent file following the pattern:
```typescript
class CustomTestAgent {
  async runAllTests(): Promise<AgentReport> {
    // Your test logic here
  }
}
```

2. Add to `master-test-agent.ts`:
```typescript
import { CustomTestAgent } from './custom-test-agent';

// Add to agents array
{
  name: 'Custom Tests',
  instance: new CustomTestAgent(),
  enabled: true
}
```

## 🎯 Best Practices

### For Developers
- Run agents before committing code
- Address critical issues immediately
- Review warnings and plan improvements
- Use specific agents for focused testing

### For CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Run Testing Agents
  run: |
    npm run test:agents
  env:
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Monitoring and Alerts
- Set up automated runs in production
- Monitor for regression in test scores
- Alert on critical issue increases
- Track recommendation implementation

## 🔍 Troubleshooting

### Common Issues

**Agent fails to run:**
- Check TypeScript compilation: `npx tsc --noEmit`
- Verify all dependencies are installed: `npm install`
- Check file permissions

**Missing environment variables:**
- Copy `.env.example` to `.env.local`
- Set all required environment variables
- Restart development server

**Import errors:**
- Check file paths in import statements
- Ensure all agent files are properly exported
- Verify TypeScript configuration

**Performance issues:**
- Use `--sequential` flag for memory-constrained environments
- Skip non-critical agents with `--skip` flag
- Run individual agents for focused testing

## 📈 Metrics and Analytics

The agent system tracks:
- Test execution time and performance
- Pass/fail rates over time
- Critical issue trends
- Recommendation implementation status
- Coverage across different system areas

## 🤝 Contributing

When contributing to the agent system:

1. Follow the existing agent pattern
2. Include comprehensive error handling
3. Provide clear test names and messages
4. Add specific recommendations for failures
5. Test your agent with various scenarios
6. Update this README with new features

## 📚 Architecture

The testing agent system follows these principles:

- **Modular Design**: Each agent focuses on specific functionality
- **Consistent Interface**: All agents implement the same report structure
- **Comprehensive Coverage**: Tests cover functionality, performance, security
- **Actionable Results**: Reports include specific recommendations
- **Scalable Architecture**: Easy to add new agents and test types

## 🔒 Security Considerations

- Agents don't expose sensitive data in reports
- API keys are validated but never logged
- Database connections use secure practices
- Error messages are sanitized before reporting

---

**Need Help?**
- Check the individual agent files for detailed implementation
- Review the master agent for coordination logic
- Look at existing tests for patterns and examples
- Create issues for bugs or feature requests