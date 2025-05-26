export interface Result {
  id: number;
  createdAt: string;
  updatedAt: string;
  allureLink: string;
  retry: number;
  status: string;
  duration: number;
  startTime: string;
  specId: number;
  executionId: number;
  spec: ResultSpec;
  execution: ResultExecution;
  errors: ResultError[];
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
  assumptions: unknown[];
}
