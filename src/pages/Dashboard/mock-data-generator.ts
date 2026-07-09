// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';
import { subDays, format } from 'date-fns';

import { DashboardResponse, ExecutionSummary } from '@/redux/apis/generatedApi';

export const generateMockDashboardData = (): DashboardResponse => {
  const historyDays = 30;
  const history = [];

  let totalRuns = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (let i = historyDays - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Randomize daily volume
    const totalTests = faker.number.int({ min: 10, max: 200 });
    // Assume high pass rate usually
    const passed = faker.number.int({ min: Math.floor(totalTests * 0.8), max: totalTests });
    const remaining = totalTests - passed;
    const failed = faker.number.int({ min: 0, max: remaining });
    const skipped = faker.number.int({ min: 0, max: remaining - failed });
    const timedOut = remaining - failed - skipped;

    // Issues distribution for failed tests
    // Ensure sum matches failed count (roughly, or exactly if strict)
    // The API type DashboardIssueMetrics doesn't strictly enforce sum = failed, but logically it implies categorization of failures.
    // Let's distribute failed count into buckets.

    // Simple distribution
    const bug = failed > 0 ? faker.number.int({ min: 0, max: failed }) : 0;
    const environment = failed - bug > 0 ? faker.number.int({ min: 0, max: failed - bug }) : 0;
    const script = failed - bug - environment > 0 ? faker.number.int({ min: 0, max: failed - bug - environment }) : 0;
    const performance =
      failed - bug - environment - script > 0
        ? faker.number.int({ min: 0, max: failed - bug - environment - script })
        : 0;
    const other = failed - bug - environment - script - performance;

    const metrics = {
      total: totalTests,
      passed,
      failed,
      skipped,
      timedOut,
      duration: faker.number.int({ min: 60000, max: 600000 }), // 1 min to 10 mins
      issues: {
        bug,
        environment,
        script,
        performance,
        other: Math.max(0, other),
      },
    };

    history.push({
      date: dateStr,
      metrics,
    });

    // Accumulate for summary
    // Summary usually aggregates run executions, but here history is "Metrics" which seems to be aggregated per day.
    // The API definition says "history: { ..., metrics: DailyExecutionMetrics }".
    // And "summary: { totalRuns: number ... }".
    // Assuming "totalRuns" means total executions, but our history is daily aggregated tests.
    // Let's assume totalRuns in summary refers to number of execution jobs, which we don't strictly have in daily test metrics unless we simulate them.
    // We'll just generate a plausible summary.
    totalRuns += totalTests;
    totalPassed += passed;
    totalFailed += failed;
  }

  // Calculate overall pass rate from history or just average it
  const overallPassRate = parseFloat(
    ((history.reduce((acc, day) => acc + day.metrics.passed / day.metrics.total, 0) / historyDays) * 100).toFixed(1),
  );

  // Recent executions
  const recentExecutions: ExecutionSummary[] = Array.from({ length: 10 }).map(() => {
    const total = faker.number.int({ min: 10, max: 100 });
    const passed = faker.number.int({ min: Math.floor(total * 0.7), max: total });
    const failed = total - passed;

    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Nightly Run',
        'Sanity Check',
        'E2E Regression',
        'Smoke Test',
        'PR Validation',
      ]),
      status: failed === 0 ? 'passed' : 'failed',
      startedAt: faker.date.recent({ days: 2 }).toISOString(),
      duration: faker.number.int({ min: 30000, max: 300000 }),
      type: faker.helpers.arrayElement(['Nightly', 'OnDemand', 'CI']),
      environment: faker.helpers.arrayElement(['dev', 'staging', 'prod']),
      metrics: {
        total,
        passed,
        failed,
      },
    };
  });

  return {
    summary: {
      totalRuns: totalRuns,
      failures: totalFailed,
      passRate: totalRuns ? parseFloat(((totalPassed / totalRuns) * 100).toFixed(1)) : overallPassRate,
      passRateTrend: faker.number.float({ min: -5, max: 5, fractionDigits: 1 }),
    },
    history,
    recentExecutions,
  };
};
