import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const MOBILE_VIEWPORT = { width: 375, height: 667 };

const PAGES_TO_CHECK = [
  { path: '/', name: 'Landing' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/forgot-password', name: 'Forgot Password' },
  { path: '/terms', name: 'Terms' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/cookies', name: 'Cookies' },
];

test.describe('Browser Console Log Analysis', () => {
  let allLogs: Array<{ page: string; type: string; message: string }> = [];
  let allErrors: Array<{ page: string; error: string }> = [];

  PAGES_TO_CHECK.forEach(({ path, name }) => {
    test(`${name} - capture console logs`, async ({ page }) => {
      const pageLogs: Array<{ type: string; message: string }> = [];
      const pageErrors: string[] = [];

      // Listen to console messages
      page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();

        pageLogs.push({ type, message: text });
        allLogs.push({ page: name, type, message: text });
      });

      // Listen to page errors
      page.on('pageerror', error => {
        const errorMsg = error.message;
        pageErrors.push(errorMsg);
        allErrors.push({ page: name, error: errorMsg });
      });

      // Set viewport to mobile
      await page.setViewportSize(MOBILE_VIEWPORT);

      // Navigate to page
      await page.goto(BASE_URL + path);
      await page.waitForLoadState('networkidle');

      // Wait a bit for any lazy-loaded console messages
      await page.waitForTimeout(2000);

      // Log summary for this page
      const errors = pageLogs.filter(l => l.type === 'error');
      const warnings = pageLogs.filter(l => l.type === 'warning');

      console.log(`\n=== ${name} (${path}) ===`);
      console.log(`Total console messages: ${pageLogs.length}`);
      console.log(`Errors: ${errors.length + pageErrors.length}`);
      console.log(`Warnings: ${warnings.length}`);

      if (errors.length > 0) {
        console.log('\nConsole Errors:');
        errors.forEach(e => console.log(`  - ${e.message}`));
      }

      if (pageErrors.length > 0) {
        console.log('\nPage Errors:');
        pageErrors.forEach(e => console.log(`  - ${e}`));
      }

      if (warnings.length > 0) {
        console.log('\nWarnings:');
        warnings.forEach(w => console.log(`  - ${w.message}`));
      }
    });
  });

  test.afterAll(async () => {
    // Generate comprehensive report
    const report = generateConsoleReport(allLogs, allErrors);
    const fs = require('fs');
    fs.writeFileSync('/home/bookproof-platform/overview/browser_console.log', report);
    console.log('\n\n=== REPORT SAVED ===');
    console.log('Full report saved to: /home/bookproof-platform/overview/browser_console.log');
  });
});

function generateConsoleReport(
  logs: Array<{ page: string; type: string; message: string }>,
  errors: Array<{ page: string; error: string }>
): string {
  const timestamp = new Date().toISOString();

  let report = `# Browser Console Log Analysis
Generated: ${timestamp}
Viewport: 375x667 (Mobile - iPhone SE)
Base URL: http://localhost:3000

## Summary

`;

  // Count by type
  const errorCount = logs.filter(l => l.type === 'error').length + errors.length;
  const warningCount = logs.filter(l => l.type === 'warning').length;
  const infoCount = logs.filter(l => l.type === 'info' || l.type === 'log').length;
  const totalCount = logs.length;

  report += `Total Console Messages: ${totalCount}\n`;
  report += `- Errors: ${errorCount}\n`;
  report += `- Warnings: ${warningCount}\n`;
  report += `- Info/Log: ${infoCount}\n\n`;

  if (errorCount === 0 && warningCount === 0) {
    report += `✅ **NO ERRORS OR WARNINGS DETECTED**\n\n`;
    report += `All pages loaded cleanly without console errors or warnings.\n\n`;
  } else {
    report += `⚠️ **ISSUES DETECTED**\n\n`;
  }

  // Group by page
  const pageGroups = new Map<string, typeof logs>();
  const pageErrorGroups = new Map<string, typeof errors>();

  logs.forEach(log => {
    if (!pageGroups.has(log.page)) {
      pageGroups.set(log.page, []);
    }
    pageGroups.get(log.page)!.push(log);
  });

  errors.forEach(error => {
    if (!pageErrorGroups.has(error.page)) {
      pageErrorGroups.set(error.page, []);
    }
    pageErrorGroups.get(error.page)!.push(error);
  });

  report += `## Detailed Breakdown by Page\n\n`;

  // Iterate through all checked pages
  const allPages = new Set([...pageGroups.keys(), ...pageErrorGroups.keys()]);

  Array.from(allPages).sort().forEach(pageName => {
    const pageLogs = pageGroups.get(pageName) || [];
    const pageErrors = pageErrorGroups.get(pageName) || [];

    const errors = pageLogs.filter(l => l.type === 'error');
    const warnings = pageLogs.filter(l => l.type === 'warning');
    const info = pageLogs.filter(l => l.type === 'info' || l.type === 'log');

    report += `### ${pageName}\n\n`;
    report += `Total messages: ${pageLogs.length}\n`;
    report += `- Errors: ${errors.length + pageErrors.length}\n`;
    report += `- Warnings: ${warnings.length}\n`;
    report += `- Info: ${info.length}\n\n`;

    if (errors.length > 0) {
      report += `#### Console Errors\n\n\`\`\`\n`;
      errors.forEach(e => {
        report += `${e.message}\n`;
      });
      report += `\`\`\`\n\n`;
    }

    if (pageErrors.length > 0) {
      report += `#### Page Errors\n\n\`\`\`\n`;
      pageErrors.forEach(e => {
        report += `${e.error}\n`;
      });
      report += `\`\`\`\n\n`;
    }

    if (warnings.length > 0) {
      report += `#### Warnings\n\n\`\`\`\n`;
      warnings.forEach(w => {
        report += `${w.message}\n`;
      });
      report += `\`\`\`\n\n`;
    }

    if (errors.length === 0 && pageErrors.length === 0 && warnings.length === 0) {
      report += `✅ No errors or warnings\n\n`;
    }

    report += `---\n\n`;
  });

  // Common issues section
  if (errorCount > 0 || warningCount > 0) {
    report += `## Common Issues Found\n\n`;

    const allMessages = [
      ...logs.filter(l => l.type === 'error' || l.type === 'warning').map(l => l.message),
      ...errors.map(e => e.error)
    ];

    const messageCounts = new Map<string, number>();
    allMessages.forEach(msg => {
      // Normalize message for grouping
      const normalized = msg.substring(0, 100);
      messageCounts.set(normalized, (messageCounts.get(normalized) || 0) + 1);
    });

    const sortedIssues = Array.from(messageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedIssues.forEach(([message, count]) => {
      report += `- **${count}x** ${message}\n`;
    });

    report += `\n`;
  }

  report += `## Analysis\n\n`;

  if (errorCount === 0 && warningCount === 0) {
    report += `The application is running cleanly without any console errors or warnings.\n`;
    report += `This indicates:\n`;
    report += `- No JavaScript errors\n`;
    report += `- No React warnings (duplicate keys, prop types, etc.)\n`;
    report += `- No network request failures\n`;
    report += `- No resource loading issues\n\n`;
    report += `✅ **Console health: EXCELLENT**\n`;
  } else {
    report += `Issues detected that should be reviewed:\n\n`;

    if (errorCount > 0) {
      report += `**Errors (${errorCount})**: These are JavaScript errors that could impact functionality.\n`;
    }

    if (warningCount > 0) {
      report += `**Warnings (${warningCount})**: These are non-critical but should be addressed for code quality.\n`;
    }

    report += `\n⚠️ **Console health: NEEDS ATTENTION**\n`;
  }

  report += `\n## Recommendations\n\n`;

  if (errorCount > 0) {
    report += `1. Fix all console errors immediately - they may cause functionality issues\n`;
  }

  if (warningCount > 0) {
    report += `2. Address console warnings to improve code quality\n`;
  }

  if (errorCount === 0 && warningCount === 0) {
    report += `No action required - console is clean!\n`;
  }

  return report;
}
