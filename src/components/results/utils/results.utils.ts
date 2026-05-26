import { AnalysisCategory, BaseResult, Result, ResultExecution, ResultSpec, ResultsFilters } from '@/types';

export type SpecGroup = {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
};

export const toAnalysisCategory = (value?: string): AnalysisCategory | undefined => {
  if (!value) return undefined;
  return Object.values(AnalysisCategory).includes(value as AnalysisCategory) ? (value as AnalysisCategory) : undefined;
};

export const toBaseResult = (result: Result): BaseResult => ({
  id: result.id,
  createdAt: result.createdAt,
  updatedAt: result.updatedAt,
  reportPortalLink: result.reportPortalLink,
  retry: result.retry,
  status: result.status,
  duration: result.duration,
  startTime: result.startTime,
  specId: result.specId,
  executionId: result.executionId,
  errors: result.errors,
  analysisCategory: toAnalysisCategory(result.analysisFeedbackCategory) ?? result.analysisCategory,
  analysisConfidence: result.analysisFeedbackConfidence ?? result.analysisConfidence,
  analysisStatus: result.analysisStatus,
  analysisConclusion: result.analysisFeedbackConclusion ?? result.analysisConclusion,
  analysisFeedbackCategory: result.analysisFeedbackCategory,
  analysisFeedbackConfidence: result.analysisFeedbackConfidence,
  analysisFeedbackConclusion: result.analysisFeedbackConclusion,
  analysisErrorQuality: result.analysisErrorQuality,
  analysisErrorQualityConclusion: result.analysisErrorQualityConclusion,
});

export const matchesFilters = (result: Result, filters: ResultsFilters): boolean => {
  if (filters.tags && filters.tags.length > 0) {
    const tagsArray = typeof filters.tags === 'string' ? (filters.tags as string).split(',') : filters.tags;
    const hasMatchingTag = tagsArray.some((tag) => result.spec.tags.includes(tag));
    if (!hasMatchingTag) return false;
  }
  if (filters.specId && result.spec.id !== filters.specId) return false;
  if (filters.specFile && !result.spec.file.toLowerCase().includes(filters.specFile.toLowerCase())) return false;
  if (filters.specName && !result.spec.title.toLowerCase().includes(filters.specName.toLowerCase())) return false;
  if (filters.environment && result.execution.environment !== filters.environment) return false;
  if (filters.type && result.execution.type !== filters.type) return false;
  if (filters.status && result.status !== filters.status) return false;
  if (filters.errorMessage) {
    const hasMatchingError = result.errors.some((e) =>
      e.message.toLowerCase().includes(filters.errorMessage.toLowerCase()),
    );
    if (!hasMatchingError) return false;
  }
  if (filters.issueName) {
    const hasMatchingIssue = result.errors.some((e) =>
      e.assumptions.some((a) => a.issue.name.toLowerCase().includes(filters.issueName.toLowerCase())),
    );
    if (!hasMatchingIssue) return false;
  }
  if (filters.reviewStatus) {
    const hasReviewedErrors = result.errors.some((e) => e.assumptions.length > 0);
    if (filters.reviewStatus === 'reviewed' && !hasReviewedErrors) return false;
    if (filters.reviewStatus === 'unreviewed' && hasReviewedErrors) return false;
  }
  return true;
};

export const addToSpecGroup = (map: Map<string, SpecGroup>, result: Result, baseResult: BaseResult): void => {
  const specKey = result.spec.key;
  if (map.has(specKey)) {
    const saved = map.get(specKey)!;
    const savedExecution = saved.executions.find((e) => e.execution.id === result.execution.id);
    if (savedExecution) {
      savedExecution.results.push(baseResult);
    } else {
      saved.executions.push({ execution: result.execution, results: [baseResult] });
    }
  } else {
    map.set(specKey, {
      spec: result.spec,
      executions: [{ execution: result.execution, results: [baseResult] }],
    });
  }
};
