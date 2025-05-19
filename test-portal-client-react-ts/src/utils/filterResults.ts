import type { FilterParamsState } from '../hooks/useFilterParams';
import type { ModelledResultRecord } from './toModels';
// We'll need to ensure Spec, Execution, Result, ResultError, Assumption types in models.ts
// have the properties accessed here (e.g., spec.tags, execution.environment, etc.)

export const filterResults = (
  resultModels: ModelledResultRecord[],
  filterParams: FilterParamsState
): ModelledResultRecord[] => {
  const matchTag = (spec: ModelledResultRecord['spec']) => {
    if (filterParams.tag && spec.tags && Array.isArray(spec.tags)) {
      return spec.tags.some((t: string) =>
        String(t).toLowerCase().includes(filterParams.tag.toLowerCase())
      );
    }
    return !filterParams.tag; // True if no tag filter
  };

  const matchSpecKey = (spec: ModelledResultRecord['spec']) => {
    if (filterParams.specId && spec.key) {
      return String(spec.key)
        .toLowerCase()
        .includes(filterParams.specId.toLowerCase());
    }
    return !filterParams.specId;
  };

  const matchSpecFile = (spec: ModelledResultRecord['spec']) => {
    if (filterParams.specFile && spec.file) {
      return String(spec.file)
        .toLowerCase()
        .includes(filterParams.specFile.toLowerCase());
    }
    return !filterParams.specFile;
  };

  const matchSpecTitle = (spec: ModelledResultRecord['spec']) => {
    if (filterParams.specName && spec.title) {
      return String(spec.title)
        .toLowerCase()
        .includes(filterParams.specName.toLowerCase());
    }
    return !filterParams.specName;
  };

  const matchEnv = (execution: ModelledResultRecord['execution']) => {
    if (filterParams.environment && execution.environment) {
      return (
        String(execution.environment).toLowerCase() ===
        filterParams.environment.toLowerCase()
      );
    }
    return !filterParams.environment;
  };

  const matchExecType = (execution: ModelledResultRecord['execution']) => {
    if (filterParams.type && execution.type) {
      return (
        String(execution.type).toLowerCase() === filterParams.type.toLowerCase()
      );
    }
    return !filterParams.type;
  };

  const matchReviewStatus = (
    result: ModelledResultRecord['result'],
    assumptions: ModelledResultRecord['assumptions']
  ) => {
    if (filterParams.reviewStatus) {
      const totalAssumptions = assumptions?.length || 0;
      const confirmedAssumptions =
        assumptions?.filter((a) => a.isConfirmed).length || 0;

      let reviewStatus = 'inCompleted'; // Default
      if (result.status === 'passed') {
        reviewStatus = 'completed';
      } else if (
        totalAssumptions > 0 &&
        confirmedAssumptions === totalAssumptions
      ) {
        reviewStatus = 'completed';
      } // else it remains inCompleted, or if no assumptions and not passed.

      return (
        reviewStatus.toLowerCase() === filterParams.reviewStatus.toLowerCase()
      );
    }
    return !filterParams.reviewStatus;
  };

  const matchStatus = (result: ModelledResultRecord['result']) => {
    if (filterParams.status && result.status) {
      return (
        String(result.status).toLowerCase() ===
        filterParams.status.toLowerCase()
      );
    }
    return !filterParams.status;
  };

  const matchErrorMessage = (errors: ModelledResultRecord['errors']) => {
    if (filterParams.errorMessage && errors && errors.length > 0) {
      return errors.some((error) => {
        return (
          error.message &&
          String(error.message)
            .toLowerCase()
            .includes(filterParams.errorMessage.toLowerCase())
        );
      });
    }
    return !filterParams.errorMessage;
  };

  return resultModels.filter(
    ({ result, spec, execution, errors, assumptions }) => {
      return (
        matchReviewStatus(result, assumptions) &&
        matchStatus(result) &&
        matchErrorMessage(errors) &&
        matchTag(spec) &&
        matchSpecKey(spec) &&
        matchSpecFile(spec) &&
        matchSpecTitle(spec) &&
        matchEnv(execution) &&
        matchExecType(execution)
      );
    }
  );
};
