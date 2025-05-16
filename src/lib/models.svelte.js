export class Spec {
    /**
     * @param {Object} spec
     */
    constructor(spec) {
        Object.entries(spec).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}

export class Execution {
    /**
     * @param {Object} execution
     */
    constructor(execution) {
        Object.entries(execution).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}

export class Result {
    #isSelected = $state(false);
    #isActive = $state(false);

    /**
     * @param {Object} result
     */
    constructor(result) {
        Object.entries(result).forEach(([key, value]) => {
            this[key] = value;
        });
    }

    get isSelected() {
        return this.#isSelected;
    }

    set isSelected(value) {
        if (this.#isActive) {
            this.#isSelected = value;
        } else {
            this.#isSelected = false;
        }
    }

    get isActive() {
        return this.#isActive;
    }

    set isActive(value) {
        this.#isActive = value;

        if (this.isSelected && !this.#isActive) {
            this.isSelected = false;
        }
    }

    /**
     * @return {string} start time key in YYYY-MM-DD format
     */
    get dateKey() {
        const [date] = this.startTime.split('T');
        return date;
    }
}

export class ResultError {
    /**
     * @param {Object} error
     */
    constructor(error) {
        Object.entries(error).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}

export class Assumption {
    #isConfirmed = $state();

    constructor(assumption) {
        Object.entries(assumption).forEach(([key, value]) => {
            this[key] = value;

            if (key === 'isConfirmed') {
                this.#isConfirmed = value;
            }
        });
    }

    get isConfirmed() {
        return this.#isConfirmed;
    }

    set isConfirmed(value) {
        this.#isConfirmed = value;
    }
}

export class Issue {
    constructor(issue) {
        Object.entries(issue).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}