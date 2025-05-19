// It's good practice to define interfaces for the constructor parameters if they are plain objects
interface SpecData {
  id: string | number; // Assuming 'id' exists based on group-results.ts
  tags?: string[]; // Added
  key?: string; // Added
  file?: string; // Added
  title?: string; // Added
  // Add other known properties of Spec
  [key: string]: any;
}

export class Spec {
  id: string | number;
  tags: string[];
  key: string;
  file: string;
  title: string;
  // Define other properties of Spec explicitly
  [key: string]: any; // For any other dynamic properties

  constructor(spec: SpecData) {
    this.id = spec.id;
    this.tags = spec.tags || [];
    this.key = spec.key || '';
    this.file = spec.file || '';
    this.title = spec.title || '';
    Object.keys(spec).forEach((key) => {
      if (!(key in this)) {
        // Assign only if not already explicitly defined
        (this as any)[key] = spec[key];
      }
    });
  }
}

interface ExecutionData {
  environment?: string; // Added
  type?: string; // Added
  // Add known properties of Execution
  [key: string]: any;
}

export class Execution {
  environment: string;
  type: string;
  // Define properties of Execution explicitly
  [key: string]: any;

  constructor(execution: ExecutionData) {
    this.environment = execution.environment || '';
    this.type = execution.type || '';
    Object.keys(execution).forEach((key) => {
      (this as any)[key] = execution[key];
    });
  }
}

interface ResultData {
  startTime: string; // Assuming startTime exists based on dateKey getter
  status?: string; // Added
  // Add other known properties of Result
  [key: string]: any;
}

export class Result {
  #isSelected: boolean = false;
  #isActive: boolean = false;
  startTime: string;
  status: string;
  // Define other properties of Result explicitly
  [key: string]: any;

  constructor(result: ResultData) {
    this.startTime = result.startTime;
    this.status = result.status || '';
    Object.keys(result).forEach((key) => {
      if (!(key in this)) {
        (this as any)[key] = result[key];
      }
    });
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
    const [date] = this.startTime.split('T');
    return date;
  }
}

interface ResultErrorData {
  id?: string | number; // Added id
  message?: string; // Added
  [key: string]: any;
}
export class ResultError {
  id?: string | number; // Added id
  message: string;
  [key: string]: any;
  constructor(error: ResultErrorData) {
    this.id = error.id;
    this.message = error.message || '';
    Object.keys(error).forEach((key) => {
      if (!(key in this)) {
        (this as any)[key] = error[key];
      }
    });
  }
}

interface AssumptionData {
  id?: string | number; // Added id
  isConfirmed?: boolean; // Optional as it seems to be initialized/set later
  issue?: Issue; // Added optional issue
  [key: string]: any;
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
        key === 'isConfirmed' &&
        typeof assumption.isConfirmed === 'boolean'
      ) {
        this.#isConfirmed = assumption.isConfirmed;
      } else if (key !== 'issue' && key !== 'id' && !(key in this)) {
        // Avoid re-assigning issue if handled explicitly
        (this as any)[key] = assumption[key];
      }
    });
    // If isConfirmed was not in assumption, it defaults to false. This handles explicit undefined too.
    if (typeof assumption.isConfirmed === 'boolean') {
      this.#isConfirmed = assumption.isConfirmed;
    } else if (
      assumption.isConfirmed === undefined &&
      Object.prototype.hasOwnProperty.call(assumption, 'isConfirmed')
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
  [key: string]: any;
}
export class Issue {
  [key: string]: any;
  constructor(issue: IssueData) {
    Object.keys(issue).forEach((key) => {
      (this as any)[key] = issue[key];
    });
  }
}
