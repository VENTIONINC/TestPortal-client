import {FilterParams} from './resultFilters.svelte.js';

export const filterResults = (resultModels) => {
    const matchTag = (spec) => {
        if (FilterParams.tag) {
            return spec.tags.some(t => t.toLowerCase().includes(FilterParams.tag.toLowerCase()));
        }

        return true;
    }

    const matchSpecKey = (spec) => {
        if (FilterParams.specId) {
            return spec.key.toLowerCase().includes(FilterParams.specId.toLowerCase())
        }

        return true;
    }

    const matchSpecFile = (spec) => {
        if (FilterParams.specFile) {
            return spec.file.toLowerCase().includes(FilterParams.specFile.toLowerCase());
        }

        return true;
    }

    const matchSpecTitle = (spec) => {
        if (FilterParams.specName) {
            return spec.title.toLowerCase().includes(FilterParams.specName.toLowerCase());
        }

        return true;
    }

    const matchEnv = (execution) => {
        if (FilterParams.environment) {
            return execution.environment.toLowerCase() === FilterParams.environment.toLowerCase();
        }

        return true;
    }

    const matchExecType = (execution) => {
        if (FilterParams.type) {
            return execution.type.toLowerCase() === FilterParams.type.toLowerCase();
        }

        return true;
    }

    const matchReviewStatus = (result, assumptions) => {
        if (FilterParams.reviewStatus) {
            const reviewStatus = assumptions.length && assumptions.some(a => a.isConfirmed)
                ? 'completed'
                : (result.status === 'passed' ? 'completed' : 'inCompleted');

            return reviewStatus.toLowerCase() === FilterParams.reviewStatus.toLowerCase();
        }

        return true;
    }

    const matchStatus = (result) => {
        if (FilterParams.status) {
            return result.status.toLowerCase() === FilterParams.status.toLowerCase();
        }

        return true;
    }

    const matchErrorMessage = (errors) => {
        if (FilterParams.errorMessage) {
            return errors.some((error) => {
                return error.message.toLowerCase().includes(FilterParams.errorMessage.toLowerCase());
            });
        }

        return true;
    }

    return resultModels.filter(({result, spec, execution, errors, assumptions}) => {
        return matchReviewStatus(result, assumptions) && matchStatus(result) && matchErrorMessage(errors)
            && matchTag(spec) && matchSpecKey(spec) && matchSpecFile(spec) && matchSpecTitle(spec)
            && matchEnv(execution) && matchExecType(execution);
    });
}


