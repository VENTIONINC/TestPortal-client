// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

export interface ReportConfig {
  reportName: string;
  projectName: string;
  totalTests: number;
  passRate: number;
  browsers: string[];
  workers: number;
}

export interface ReportLocation {
  file: string;
  line: number;
  column: number;
}

export interface ReportError {
  message: string;
  stack?: string;
}

export interface ReportAttachment {
  name: string;
  contentType: string;
  path: string;
}

export interface ReportStep {
  title: string;
  category: string;
  startTime: string;
  duration: number;
  steps: ReportStep[];
}

export interface TestResult {
  workerIndex: number;
  status: string;
  duration: number;
  reportPortalLink: string;
  startTime: string;
  steps: ReportStep[];
  stdout: string[];
  stderr: string[];
  attachments: ReportAttachment[];
  error?: ReportError;
}

export interface Test {
  testId: string;
  title: string;
  projectName: string;
  location: ReportLocation;
  status: string;
  duration: number;
  annotations: unknown[];
  tags: string[];
  expectedStatus: string;
  timeout: number;
  results: TestResult[];
}

export interface Spec {
  title: string;
  ok: boolean;
  tags: string[];
  tests: Test[];
}

export interface Suite {
  title: string;
  file: string;
  line: number;
  column: number;
  specs: Spec[];
}

export interface ProjectConfig {
  outputDir: string;
  repeatEach: number;
  retries: number;
  name: string;
  testDir: string;
  testIgnore: string[];
  testMatch: string[];
  timeout: number;
  use: {
    browserName: string;
    channel?: string;
    headless: boolean;
    viewport: {
      width: number;
      height: number;
    };
    ignoreHTTPSErrors: boolean;
    acceptDownloads: boolean;
    screenshot: string;
    video: string;
    trace: string;
  };
}

export interface PlaywrightConfig {
  configFile: string;
  rootDir: string;
  forbidOnly: boolean;
  fullyParallel: boolean;
  globalSetup: string | null;
  globalTeardown: string | null;
  globalTimeout: number;
  grep: Record<string, unknown>;
  grepInvert: string | null;
  maxFailures: number;
  metadata: Record<string, unknown>;
  preserveOutput: string;
  reporter: Array<[string] | [string, Record<string, unknown>]>;
  reportSlowTests: {
    max: number;
    threshold: number;
  };
  quiet: boolean;
  projects: ProjectConfig[];
  shard: string | null;
  updateSnapshots: string;
  version: string;
  workers: number;
  webServer: string | null;
}

export interface ReportStats {
  passed: number;
  failed: number;
  timedOut: number;
  skipped: number;
  total: number;
  duration: number;
  startTime: string;
}

export interface PlaywrightReport {
  reportName: string;
  config: PlaywrightConfig;
  suites: Suite[];
  tests: Test[];
  errors: unknown[];
  stats: ReportStats;
}

// CTRF Types
export interface CTRFConfig {
  toolName: string;
  toolVersion: string;
  appName: string;
  branchName: string;
  totalTests: number;
  passRate: number;
  framework: string;
  ciProvider: string;
  parallelWorkers: number;
  includeFlaky: boolean;
  includeRetries: boolean;
}

export interface CTRFTest {
  name: string;
  status: string;
  duration: number;
  suite: string;
  filePath: string;
  tags: string[];
  message?: string;
  trace?: string;
  retry?: number;
  flaky?: boolean;
}

export interface CTRFReport {
  results: {
    tool: {
      name: string;
      version: string;
    };
    summary: {
      tests: number;
      passed: number;
      failed: number;
      pending: number;
      skipped: number;
      other: number;
      start: number;
      stop: number;
    };
    tests: CTRFTest[];
    environment: {
      appName: string;
      buildName: string;
      buildNumber: string;
      buildUrl: string;
      repositoryName: string;
      repositoryUrl: string;
      branchName: string;
      testEnvironment: string;
      extra: {
        nodeVersion: string;
        platform: string;
        architecture: string;
      };
    };
    extra: {
      framework: string;
      testRunId: string;
      ciProvider: string;
      parallelWorkers: number;
    };
  };
}
