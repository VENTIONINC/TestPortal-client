interface SpecData {
  id: number;
  tags?: string[];
  key?: string;
  file?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  annotations: unknown[];
}

export class Spec {
  id: string | number;
  tags: string[];
  key: string;
  file: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  annotations: unknown[];

  constructor(spec: SpecData) {
    this.id = spec.id;
    this.tags = spec.tags || [];
    this.key = spec.key || "";
    this.file = spec.file || "";
    this.title = spec.title || "";
    this.createdAt = spec.createdAt;
    this.updatedAt = spec.updatedAt;
    this.annotations = spec.annotations;
  }
}

interface ExecutionData {
  environment: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  version: string;
  startedAt: string;
}

export class Execution {
  environment: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  version: string;
  startedAt: string;

  constructor(execution: ExecutionData) {
    this.environment = execution.environment || "";
    this.type = execution.type || "";
    this.id = execution.id;
    this.createdAt = execution.createdAt;
    this.updatedAt = execution.updatedAt;
    this.name = execution.name;
    this.version = execution.version;
    this.startedAt = execution.startedAt;
  }
}

interface ResultData {
  startTime: string; // Assuming startTime exists based on dateKey getter
  status?: string; // Added
  id: number;
  createdAt: string;
  updatedAt: string;
  allureLink: string;
  retry: number;
  duration: number;
  specId: number;
  executionId: number;
}

export class Result {
  #isSelected: boolean = false;
  #isActive: boolean = false;
  startTime: string;
  status: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  allureLink: string;
  retry: number;
  duration: number;
  specId: number;
  executionId: number;

  constructor(result: ResultData) {
    this.startTime = result.startTime;
    this.status = result.status || "";
    this.id = result.id;
    this.createdAt = result.createdAt;
    this.updatedAt = result.updatedAt;
    this.allureLink = result.allureLink;
    this.retry = result.retry;
    this.duration = result.duration;
    this.specId = result.specId;
    this.executionId = result.executionId;
  }

  get isSelected(): boolean {
    return this.#isSelected;
  }

  set isSelected(value: boolean) {
    if (this.#isActive) {
      this.#isSelected = value;
    } else {
      // When not active, attempting to select should result in isSelected being false
      this.#isSelected = false;
    }
  }

  get isActive(): boolean {
    return this.#isActive;
  }

  set isActive(value: boolean) {
    this.#isActive = value;
    if (!this.#isActive && this.#isSelected) {
      // If made inactive while selected
      this.#isSelected = false; // Also unselect
    }
  }

  get dateKey(): string {
    const [date] = this.startTime.split("T");
    return date;
  }
}

interface ResultErrorData {
  id: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  callLog: [];
  callStack: string[];
  testAssertion: string;
  expectedPattern: string;
  receivedString: string;
  location: string;
  resultId: number;
}
export class ResultError {
  id: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  callLog: [];
  callStack: string[];
  testAssertion: string;
  expectedPattern: string;
  receivedString: string;
  location: string;
  resultId: number;

  constructor(error: ResultErrorData) {
    this.id = error.id;
    this.message = error.message || "";
    this.createdAt = error.createdAt;
    this.updatedAt = error.updatedAt;
    this.type = error.type;
    this.callLog = error.callLog;
    this.callStack = error.callStack;
    this.testAssertion = error.testAssertion;
    this.expectedPattern = error.expectedPattern;
    this.receivedString = error.receivedString;
    this.location = error.location;
    this.resultId = error.resultId;
  }
}

interface AssumptionData {
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
export class Assumption {
  id?: string | number; // Added id
  #isConfirmed: boolean = false; // Default to false if not provided
  issue?: Issue; // Added optional issue
  [key: string]: any;

  constructor(assumption: AssumptionData) {
    this.id = assumption.id;
    this.issue = assumption.issue; // Assign if provided
    Object.keys(assumption).forEach((key) => {
      if (
        key === "isConfirmed" &&
        typeof assumption.isConfirmed === "boolean"
      ) {
        this.#isConfirmed = assumption.isConfirmed;
      } else if (key !== "issue" && key !== "id" && !(key in this)) {
        // Avoid re-assigning issue if handled explicitly
        (this as any)[key] = assumption[key];
      }
    });
    // If isConfirmed was not in assumption, it defaults to false. This handles explicit undefined too.
    if (typeof assumption.isConfirmed === "boolean") {
      this.#isConfirmed = assumption.isConfirmed;
    } else if (
      assumption.isConfirmed === undefined &&
      Object.prototype.hasOwnProperty.call(assumption, "isConfirmed")
    ) {
      // If isConfirmed is explicitly set to undefined, honor it if desired, or default. Here, defaulting to previous logic.
      // This part of logic for Assumption constructor might need refinement based on exact desired behavior for `isConfirmed: undefined`
    }
  }

  get isConfirmed(): boolean {
    return this.#isConfirmed;
  }

  set isConfirmed(value: boolean) {
    this.#isConfirmed = value;
  }
}

interface IssueData {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: string;
  description: string;
  portal: string;
  service: string;
  ticket: string;
}
export class Issue {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: string;
  description: string;
  portal: string;
  service: string;
  ticket: string;

  constructor(issue: IssueData) {
    this.id = issue.id;
    this.createdAt = issue.createdAt;
    this.updatedAt = issue.updatedAt;
    this.name = issue.name;
    this.category = issue.category;
    this.description = issue.description;
    this.portal = issue.portal;
    this.service = issue.service;
    this.ticket = issue.ticket;
  }
}
