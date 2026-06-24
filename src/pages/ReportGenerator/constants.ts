// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export const ENVIRONMENTS = ['prod', 'staging', 'qa', 'dev'];
export const SERVICES = ['web-app', 'api', 'mobile', 'checkout', 'auth', 'payment'];
export const BUILDS = ['nightly', 'release', 'hotfix', 'regression', 'smoke'];

export const TEST_ACTIONS = ['should', 'can', 'must', 'will'];
export const TEST_SUBJECTS = [
  'login',
  'navigate',
  'submit form',
  'load page',
  'click button',
  'validate data',
  'display content',
  'handle error',
];
export const TEST_CONTEXTS = [
  'correctly',
  'successfully',
  'with valid data',
  'on mobile',
  'in production',
  'after reload',
  'with timeout',
];

export const TEST_ERRORS = [
  {
    message: 'Timeout 30000ms exceeded.',
    location: { file: 'tests/login.spec.ts', line: 23, column: 12 },
    snippet: 'await page.click("[data-testid=submit-button]");',
  },
  {
    message: 'Element not found: [data-testid=username]',
    location: { file: 'tests/form.spec.ts', line: 45, column: 8 },
    snippet: 'await page.fill("[data-testid=username]", "user123");',
  },
  {
    message: "Expected 'Welcome' to be visible",
    location: { file: 'tests/navigation.spec.ts', line: 67, column: 15 },
    snippet: 'await expect(page.locator("h1")).toContainText("Welcome");',
  },
];

export const DEFAULT_CONFIG = {
  totalTests: 25,
  passRate: 85,
  browsers: ['chromium'],
  workers: 4,
  projectName: 'Test Suite',
};

export const REPORT_PORTAL_BASE_URL = 'https://test-portal.example.com';

// CTRF Test Configuration
export const CTRF_TEST_SUITES = [
  'Auth Service',
  'User Management',
  'API Tests',
  'Validation Tests',
  'File Operations',
  'Performance Tests',
];

export const CTRF_TEST_NAMES: Record<string, string[]> = {
  'Auth Service': ['should authenticate valid user', 'should handle invalid credentials'],
  'User Management': ['should create new user', 'should update user profile'],
  'API Tests': ['should fetch test results', 'should handle pagination'],
  'Validation Tests': ['should validate input parameters', 'should sanitize user inputs'],
  'File Operations': ['should handle file uploads', 'should validate file types'],
  'Performance Tests': ['should process large datasets', 'should handle concurrent requests'],
};

export const CTRF_TAGS = [
  ['auth', 'unit'],
  ['api', 'integration'],
];

export const CTRF_ERROR_MESSAGES = ['Database constraint violation', 'Validation error'];

export const CTRF_STACK_TRACES = ['Error: Database constraint violation'];

export const CTRF_PRESETS: Record<string, { passRate?: number; totalTests?: number }> = {
  'High Success': { passRate: 95, totalTests: 20 },
  'Mixed Results': { passRate: 75, totalTests: 30 },
};

export const DEFAULT_CTRF_CONFIG = {
  toolName: 'playwright',
  toolVersion: '1.43.0',
  appName: 'test-portal-be',
  branchName: 'develop',
  totalTests: 25,
  passRate: 75,
  framework: 'playwright',
  ciProvider: 'github-actions',
  parallelWorkers: 4,
  includeFlaky: true,
  includeRetries: true,
};
