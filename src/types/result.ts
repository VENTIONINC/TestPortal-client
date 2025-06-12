export interface BaseResult {
  id: number;
  createdAt: string;
  updatedAt: string;
  allureLink: string;
  retry: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  startTime: string;
  specId: number;
  executionId: number;
  errors: ResultError[];
}

export interface Result extends BaseResult {
  spec: ResultSpec;
  execution: ResultExecution;
}

export interface ResultSpec {
  id: number;
  createdAt: string;
  updatedAt: string;
  key: string;
  file: string;
  title: string;
  tags: string[];
  annotations: unknown[];
}

export interface ResultExecution {
  id: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  name: string;
  environment: string;
  version: string;
  startedAt: string;
}

export interface ResultError {
  id: number;
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
  resultId: number;
  assumptions: ResultErrorAssumption[];
}

export interface ResultErrorAssumption {
  id: number;
  createdAt: string;
  updatedAt: string;
  isConfirmed: boolean;
  score: number;
  madeBy: string;
  issueId: number;
  resultErrorId: number;
  issue: Issue;
}

export enum IssueCategory {
  Bug = 'Bug',
  Script = 'Script',
  Infra = 'Infra',
  Performance = 'Performance',
}

export interface Issue {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: IssueCategory;
  description: string;
  portal: string;
  service: string;
  ticket: string;
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
