import type { FilterParamsState } from '@/hooks/useFilterParams';
import { Result, ResultError, ResultExecution, ResultSpec } from '@/types';

export const filterResults = (results: Result[], filterParams: FilterParamsState): Result[] => {
  const matchTag = (spec: ResultSpec) => {
    if (filterParams.tag && spec.tags && Array.isArray(spec.tags)) {
      return spec.tags.some((t: string) => String(t).toLowerCase().includes(filterParams.tag.toLowerCase()));
    }

    return !filterParams.tag;
  };

  const matchSpecKey = (spec: ResultSpec) => {
    if (filterParams.specId && spec.key) {
      return String(spec.key).toLowerCase().includes(filterParams.specId.toLowerCase());
    }

    return !filterParams.specId;
  };

  const matchSpecFile = (spec: ResultSpec) => {
    if (filterParams.specFile && spec.file) {
      return String(spec.file).toLowerCase().includes(filterParams.specFile.toLowerCase());
    }

    return !filterParams.specFile;
  };

  const matchSpecTitle = (spec: ResultSpec) => {
    if (filterParams.specName && spec.title) {
      return String(spec.title).toLowerCase().includes(filterParams.specName.toLowerCase());
    }

    return !filterParams.specName;
  };

  const matchEnv = (execution: ResultExecution) => {
    if (filterParams.environment && execution.environment) {
      return String(execution.environment).toLowerCase() === filterParams.environment.toLowerCase();
    }

    return !filterParams.environment;
  };

  const matchExecType = (execution: ResultExecution) => {
    if (filterParams.type && execution.type) {
      return String(execution.type).toLowerCase() === filterParams.type.toLowerCase();
    }

    return !filterParams.type;
  };

  const matchReviewStatus = (result: Result) => {
    if (filterParams.reviewStatus) {
      const assumptions = result.errors.flatMap((error) => error.assumptions);
      const totalAssumptions = assumptions?.length || 0;
      const confirmedAssumptions = assumptions?.filter((a) => a.isConfirmed).length || 0;

      let reviewStatus = 'inCompleted'; // Default
      if (result.status === 'passed') {
        reviewStatus = 'completed';
      } else if (totalAssumptions > 0 && confirmedAssumptions === totalAssumptions) {
        reviewStatus = 'completed';
      } // else it remains inCompleted, or if no assumptions and not passed.

      return reviewStatus.toLowerCase() === filterParams.reviewStatus.toLowerCase();
    }
    return !filterParams.reviewStatus;
  };

  const matchErrorMessage = (errors: ResultError[]) => {
    if (filterParams.errorMessage && errors && errors.length > 0) {
      return errors.some((error) => {
        return error.message && String(error.message).toLowerCase().includes(filterParams.errorMessage.toLowerCase());
      });
    }

    return !filterParams.errorMessage;
  };

  return results.filter((result) => {
    const { spec, execution, errors } = result;

    return (
      matchReviewStatus(result) &&
      matchErrorMessage(errors) &&
      matchTag(spec) &&
      matchSpecKey(spec) &&
      matchSpecFile(spec) &&
      matchSpecTitle(spec) &&
      matchEnv(execution) &&
      matchExecType(execution)
    );
  });
};
