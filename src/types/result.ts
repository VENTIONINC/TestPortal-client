import { Issue } from './issue';

export enum ResultStatus {
  Passed = 'passed',
  Failed = 'failed',
  Skipped = 'skipped',
  TimedOut = 'timedOut',
}

export enum AnalysisStatus {
  Passed = 'passed',
  Failed = 'failed',
}

export enum AnalysisCategory {
  Bug = 'bug',
  Infra = 'infra',
  Performance = 'performance',
  Script = 'script',
  Other = 'other',
}

export interface BaseResult {
  id: string;
  createdAt: string;
  updatedAt: string;
  reportPortalLink: string;
  retry: number;
  status: ResultStatus;
  duration: number;
  startTime: string;
  specId: string;
  executionId: string;
  errors: ResultError[];
  analysisCategory?: AnalysisCategory;
  analysisConfidence?: number;
  analysisStatus?: AnalysisStatus;
  analysisConclusion?: string;
  analysisFeedbackCategory?: string;
  analysisFeedbackConfidence?: number;
  analysisFeedbackConclusion?: string;
  analysisErrorQuality?: number;
  analysisErrorQualityConclusion?: string;
}

export interface Result extends BaseResult {
  spec: ResultSpec;
  execution: ResultExecution;
}

export interface ResultSpec {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  file: string;
  title: string;
  tags: string[];
  annotations: unknown[];
}

export interface ResultExecution {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  name: string;
  environment: string;
  provider: string;
  version: string;
  startedAt: string;
}

export interface ResultError {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  message: string;
  callLog: string[];
  callStack: string[];
  testAssertion: string;
  expectedPattern: string;
  receivedString: string;
  location: string;
  resultId: string;
  assumptions: ResultErrorAssumption[];
}

export interface ResultErrorAssumption {
  id: string;
  createdAt: string;
  updatedAt: string;
  isConfirmed: boolean;
  score: number;
  madeBy: string;
  issueId: string;
  resultErrorId: string;
  issue: Issue;
}

export type ResultGroup = Map<
  string,
  {
    spec: ResultSpec;
    executions: {
      execution: ResultExecution;
      results: BaseResult[];
    }[];
  }
>;

export interface ResultsFilters {
  tag: string;
  specId: string;
  specFile: string;
  specName: string;
  environment: string;
  type: string;
  status: string;
  reviewStatus: string;
  errorMessage: string;
  issueName: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  page: number;
}
