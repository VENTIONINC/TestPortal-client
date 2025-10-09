import { saveAs } from 'file-saver';

import {
  BUILDS,
  ENVIRONMENTS,
  REPORT_PORTAL_BASE_URL,
  SERVICES,
  TEST_ACTIONS,
  TEST_CONTEXTS,
  TEST_ERRORS,
  TEST_SUBJECTS,
} from './constants';
import type { PlaywrightReport, ReportConfig, ReportError, Test, TestResult } from './types';

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
        })
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
        })
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

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }
};

export const copyTextareaToClipboard = async (textareaId: string): Promise<void> => {
  try {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    await navigator.clipboard.writeText(textarea.value);
  } catch {
    // Fallback for older browsers
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
      document.execCommand('copy');
    }
  }
};

export const downloadReport = (report: PlaywrightReport, filename?: string): void => {
  const reportName = filename || report.reportName || 'playwright-report';
  const sanitizedFilename = reportName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  saveAs(blob, `${sanitizedFilename}.json`);
};
