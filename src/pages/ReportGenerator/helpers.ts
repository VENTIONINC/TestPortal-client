// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { saveAs } from 'file-saver';

import {
  BUILDS,
  CTRF_ERROR_MESSAGES,
  CTRF_STACK_TRACES,
  CTRF_TAGS,
  CTRF_TEST_NAMES,
  CTRF_TEST_SUITES,
  ENVIRONMENTS,
  REPORT_PORTAL_BASE_URL,
  SERVICES,
  TEST_ACTIONS,
  TEST_CONTEXTS,
  TEST_ERRORS,
  TEST_SUBJECTS,
} from './constants';
import type {
  CTRFConfig,
  CTRFReport,
  CTRFTest,
  PlaywrightReport,
  ReportConfig,
  ReportError,
  Test,
  TestResult,
} from './types';

export const generateRandomString = (length = 8): string => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

export const generateProductionLikeName = (): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const buildNumber = Math.floor(Math.random() * 9999) + 1000;

  const env = ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)];
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const build = BUILDS[Math.floor(Math.random() * BUILDS.length)];

  return `${service}-${env}-${build}-${buildNumber}-${timestamp}`;
};

export const generateTestTitle = (): string => {
  const action = TEST_ACTIONS[Math.floor(Math.random() * TEST_ACTIONS.length)];
  const subject = TEST_SUBJECTS[Math.floor(Math.random() * TEST_SUBJECTS.length)];
  const context = TEST_CONTEXTS[Math.floor(Math.random() * TEST_CONTEXTS.length)];

  return `${action} ${subject} ${context}`;
};

export const generateError = (): ReportError => {
  return TEST_ERRORS[Math.floor(Math.random() * TEST_ERRORS.length)];
};

export const generateReportPortalLink = (reportName: string): string => {
  const formattedReportName = reportName.toUpperCase().replace(/-/g, '_');
  const suiteId = generateRandomString(32);
  const testCaseId = generateRandomString(16);
  return `${REPORT_PORTAL_BASE_URL}/${formattedReportName}/allure-report/index.html#suites/${suiteId}/${testCaseId}/`;
};

interface GenerateTestOptions {
  status: string;
  projectName: string;
  reportName: string;
  workers: number;
}

export const generateTest = ({ status, projectName, reportName, workers }: GenerateTestOptions): Test => {
  const testId = generateRandomString(16);
  const title = generateTestTitle();
  const duration = Math.floor(Math.random() * 5000) + 500;
  const startTime = new Date(Date.now() - Math.random() * 86400000).toISOString();

  const result: TestResult = {
    workerIndex: Math.floor(Math.random() * workers),
    status,
    duration,
    reportPortalLink: generateReportPortalLink(reportName),
    startTime,
    steps: [
      {
        title: 'Before Hooks',
        category: 'hook',
        startTime,
        duration: Math.floor(Math.random() * 200) + 50,
        steps: [],
      },
      {
        title: `${title}`,
        category: 'test.step',
        startTime,
        duration: duration - 100,
        steps: [],
      },
    ],
    stdout: [],
    stderr: [],
    attachments: [],
  };

  const test: Test = {
    testId,
    title,
    projectName,
    location: {
      file: `tests/${title.split(' ').slice(1, 3).join('-')}.spec.ts`,
      line: Math.floor(Math.random() * 100) + 1,
      column: Math.floor(Math.random() * 20) + 1,
    },
    status,
    duration,
    annotations: [],
    tags: [],
    expectedStatus: 'passed',
    timeout: 30000,
    results: [result],
  };

  // Add error details for failed tests
  if (status === 'failed' || status === 'timedOut') {
    const error = generateError();
    result.error = error;
    result.stderr.push(`Error: ${error.message}`);
  }

  // Add screenshots and videos - always include them
  result.attachments.push({
    name: 'screenshot',
    contentType: 'image/png',
    path: `test-results/${testId}/screenshot.png`,
  });

  result.attachments.push({
    name: 'video',
    contentType: 'video/webm',
    path: `test-results/${testId}/video.webm`,
  });

  return test;
};

export const generateReport = (config: ReportConfig): PlaywrightReport => {
  const { reportName, projectName, totalTests, passRate, browsers, workers } = config;
  const passedTests = Math.floor(totalTests * (passRate / 100));

  const suites: PlaywrightReport['suites'] = [];
  const tests: Test[] = [];

  browsers.forEach((browser) => {
    const browserProjectName = `${projectName} (${browser})`;
    const testsPerBrowser = Math.ceil(totalTests / browsers.length);
    const passedPerBrowser = Math.ceil(passedTests / browsers.length);

    // Generate passed tests
    for (let i = 0; i < passedPerBrowser && tests.length < totalTests; i++) {
      tests.push(
        generateTest({
          status: 'passed',
          projectName: browserProjectName,
          reportName,
          workers,
        }),
      );
    }

    // Generate failed tests
    const remainingTests = testsPerBrowser - passedPerBrowser;
    for (let i = 0; i < remainingTests && tests.length < totalTests; i++) {
      const status = Math.random() > 0.7 ? 'timedOut' : 'failed';
      tests.push(
        generateTest({
          status,
          projectName: browserProjectName,
          reportName,
          workers,
        }),
      );
    }

    suites.push({
      title: `${browser} tests`,
      file: `tests/${browser}.spec.ts`,
      line: 1,
      column: 1,
      specs: tests
        .filter((t) => t.projectName === browserProjectName)
        .map((t) => ({
          title: t.title,
          ok: t.status === 'passed',
          tags: [],
          tests: [t],
        })),
    });
  });

  const stats = {
    passed: tests.filter((t) => t.status === 'passed').length,
    failed: tests.filter((t) => t.status === 'failed').length,
    timedOut: tests.filter((t) => t.status === 'timedOut').length,
    skipped: 0,
  };

  return {
    reportName,
    config: {
      configFile: 'playwright.config.ts',
      rootDir: '/Users/developer/project',
      forbidOnly: false,
      fullyParallel: true,
      globalSetup: null,
      globalTeardown: null,
      globalTimeout: 0,
      grep: {},
      grepInvert: null,
      maxFailures: 0,
      metadata: {},
      preserveOutput: 'always',
      reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
      reportSlowTests: { max: 5, threshold: 15000 },
      quiet: false,
      projects: browsers.map((browser) => ({
        outputDir: `test-results/${browser}`,
        repeatEach: 1,
        retries: 2,
        name: `${projectName} (${browser})`,
        testDir: '/Users/developer/project/tests',
        testIgnore: [],
        testMatch: ['**/*.spec.ts'],
        timeout: 30000,
        use: {
          browserName: browser,
          channel: browser === 'chromium' ? 'chrome' : undefined,
          headless: true,
          viewport: { width: 1280, height: 720 },
          ignoreHTTPSErrors: false,
          acceptDownloads: true,
          screenshot: 'only-on-failure',
          video: 'retain-on-failure',
          trace: 'retain-on-failure',
        },
      })),
      shard: null,
      updateSnapshots: 'missing',
      version: '1.40.0',
      workers,
      webServer: null,
    },
    suites,
    tests,
    errors: [],
    stats: {
      ...stats,
      total: totalTests,
      duration: Math.floor(Math.random() * 120000) + 30000,
      startTime: new Date(Date.now() - 300000).toISOString(),
    },
  };
};

export const downloadReport = (report: PlaywrightReport, filename?: string): void => {
  const reportName = filename || report.reportName || 'playwright-report';
  const sanitizedFilename = reportName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  saveAs(blob, `${sanitizedFilename}.json`);
};

// CTRF Helper Functions
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generateCTRFDuration = (status: string): number => {
  const ranges: Record<string, [number, number]> = {
    passed: [50, 800],
    failed: [100, 1500],
    pending: [0, 0],
    skipped: [0, 0],
  };
  const [min, max] = ranges[status] || [0, 0];
  return min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateCTRFTest = (suite: string, config: CTRFConfig): CTRFTest => {
  const names = CTRF_TEST_NAMES[suite] || ['should perform basic operation'];
  const name = getRandomElement(names);

  let status: string;
  const rand = Math.random() * 100;
  if (rand < config.passRate) {
    status = 'passed';
  } else if (rand < config.passRate + 15) {
    status = 'failed';
  } else if (rand < config.passRate + 20) {
    status = 'pending';
  } else {
    status = 'skipped';
  }

  const test: CTRFTest = {
    name,
    status,
    duration: generateCTRFDuration(status),
    suite,
    filePath: `/project/src/__tests__/${suite.toLowerCase().replace(/ /g, '-')}.test.js`,
    tags: [...getRandomElement(CTRF_TAGS)],
  };

  if (status === 'failed') {
    test.message = getRandomElement(CTRF_ERROR_MESSAGES);
    test.trace = getRandomElement(CTRF_STACK_TRACES);
    if (config.includeRetries && Math.random() < 0.3) {
      test.retry = Math.floor(Math.random() * 3) + 1;
    }
    if (config.includeFlaky && Math.random() < 0.2) {
      test.flaky = true;
    }
  }

  return test;
};

export const generateCTRFReport = (config: CTRFConfig): CTRFReport => {
  const tests: CTRFTest[] = [];
  for (let i = 0; i < config.totalTests; i++) {
    const suite = getRandomElement(CTRF_TEST_SUITES);
    tests.push(generateCTRFTest(suite, config));
  }

  const now = Date.now();
  const totalDuration = tests.reduce((sum, test) => sum + test.duration, 0);

  const report: CTRFReport = {
    results: {
      tool: { name: config.toolName, version: config.toolVersion },
      summary: {
        tests: tests.length,
        passed: tests.filter((t) => t.status === 'passed').length,
        failed: tests.filter((t) => t.status === 'failed').length,
        pending: tests.filter((t) => t.status === 'pending').length,
        skipped: tests.filter((t) => t.status === 'skipped').length,
        other: 0,
        start: now - totalDuration,
        stop: now,
      },
      tests,
      environment: {
        appName: config.appName,
        buildName: config.branchName,
        buildNumber: `1.0.0-build.${Math.floor(Math.random() * 9999)}`,
        buildUrl: 'https://ci.example.com/builds/123',
        repositoryName: config.appName,
        repositoryUrl: `https://github.com/example/${config.appName}`,
        branchName: config.branchName,
        testEnvironment: 'ci',
        extra: { nodeVersion: '18.17.0', platform: 'linux', architecture: 'x64' },
      },
      extra: {
        framework: config.framework,
        testRunId: `run-${Date.now()}`,
        ciProvider: config.ciProvider,
        parallelWorkers: config.parallelWorkers,
      },
    },
  };

  return report;
};

export const downloadCTRFReport = (report: CTRFReport): void => {
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, `ctrf-report-${Date.now()}.json`);
};
