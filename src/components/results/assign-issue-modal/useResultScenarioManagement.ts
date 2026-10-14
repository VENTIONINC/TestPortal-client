// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import {
  useLazyGetResultDetailWithRelatedScenariosQuery,
  type RelatedTestScenarioSummary,
} from '@/redux/apis/resultDetailApi';
import {
  useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation,
  usePostApiV2TestScenariosByScenarioIdSpecLinksMutation,
} from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosForResultLinkManagementQuery } from '@/redux/apis/scenarioManagementApi';

type PaneMode = 'list' | 'picker' | 'inspect' | 'unlink';
export type ScenarioManagementFeedback = { kind: 'error' | 'success'; message: string; canRefresh?: boolean };

const PAGE_SIZE = 10;

export const getScenarioManagementErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) return error.status;
  return undefined;
};

export const scenarioLabel = (scenario: Pick<RelatedTestScenarioSummary, 'scenarioKey' | 'title'>) =>
  `${scenario.scenarioKey || 'N/A'} · ${scenario.title}`;

export const useResultScenarioManagement = ({ resultId, projectId, isActive }: { resultId: string; projectId: string; isActive: boolean }) => {
  const generation = useRef(0);
  const pendingWrite = useRef(false);
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const unlinkButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusOnReturnRef = useRef<'link' | { scenarioId: string } | null>(null);
  const [mode, setMode] = useState<PaneMode>('list');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>();
  const [confirmScenario, setConfirmScenario] = useState<RelatedTestScenarioSummary>();
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>();
  const [feedback, setFeedback] = useState<ScenarioManagementFeedback>();
  const [isWritePending, setIsWritePending] = useState(false);
  const [coverageNeedsRefresh, setCoverageNeedsRefresh] = useState(false);
  const [fetchResultDetail, resultQuery] = useLazyGetResultDetailWithRelatedScenariosQuery();
  const [linkScenario] = usePostApiV2TestScenariosByScenarioIdSpecLinksMutation();
  const [unlinkScenario] = useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation();

  const isCurrentScope = resultQuery.originalArgs?.resultId === resultId && resultQuery.originalArgs.projectId === projectId;
  const result = isCurrentScope && resultQuery.currentData?.id === resultId ? resultQuery.currentData : undefined;
  const error = isCurrentScope ? resultQuery.error : undefined;
  const selectedScenario = result?.relatedTestScenarios.find((scenario) => scenario.id === selectedScenarioId);
  const pickerQueryArg = {
    projectId,
    page,
    limit: PAGE_SIZE,
    ...(appliedSearch ? { search: appliedSearch } : {}),
  };
  const pickerQuery = useGetApiV2TestScenariosForResultLinkManagementQuery(pickerQueryArg, { skip: !isActive || mode !== 'picker' });
  const candidates = pickerQuery.currentData?.scenarios ?? [];
  const linkedIds = new Set(result?.relatedTestScenarios.map(({ id }) => id) ?? []);
  const totalPages = pickerQuery.currentData?.totalPages ?? 0;

  useEffect(() => {
    generation.current += 1;
    setMode('list');
    setSelectedScenarioId(undefined);
    setConfirmScenario(undefined);
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
    setSelectedCandidateId(undefined);
    setFeedback(undefined);
    setCoverageNeedsRefresh(false);
    pendingWrite.current = false;
    setIsWritePending(false);
    focusOnReturnRef.current = null;

    if (!isActive) return;
    void fetchResultDetail({ resultId, projectId });
    return () => {
      generation.current += 1;
    };
  }, [fetchResultDetail, isActive, projectId, resultId]);

  useEffect(() => {
    if (mode !== 'list' || !focusOnReturnRef.current) return;
    const target = focusOnReturnRef.current === 'link'
      ? linkButtonRef.current
      : unlinkButtonRefs.current.get(focusOnReturnRef.current.scenarioId);
    target?.focus();
    focusOnReturnRef.current = null;
  }, [mode]);

  const isCurrentGeneration = useCallback((capturedGeneration: number) =>
    isActive && generation.current === capturedGeneration,
  [isActive]);

  const refreshAuthoritativeData = useCallback(async (capturedGeneration: number) => {
    try {
      await fetchResultDetail({ resultId, projectId }).unwrap();
      if (!isCurrentGeneration(capturedGeneration)) return true;
      if (mode === 'picker') await pickerQuery.refetch().unwrap();
      return true;
    } catch {
      return false;
    }
  }, [fetchResultDetail, isCurrentGeneration, mode, pickerQuery, projectId, resultId]);

  const enterPicker = () => {
    setFeedback(undefined);
    setCoverageNeedsRefresh(false);
    setMode('picker');
    setSelectedCandidateId(undefined);
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  const cancelPicker = () => {
    setMode('list');
    setSelectedCandidateId(undefined);
    setFeedback(undefined);
    focusOnReturnRef.current = 'link';
  };

  const applySearch = (event: FormEvent) => {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
    setSelectedCandidateId(undefined);
    setFeedback(undefined);
  };

  const submitLink = async () => {
    if (!result || !selectedCandidateId || pendingWrite.current || coverageNeedsRefresh || linkedIds.has(selectedCandidateId)) return;
    pendingWrite.current = true;
    setFeedback(undefined);
    const capturedGeneration = generation.current;
    const scenarioId = selectedCandidateId;
    setIsWritePending(true);

    try {
      await linkScenario({ scenarioId, projectId, testScenarioSpecLinkBody: { specId: result.spec.id } }).unwrap();
      if (!isCurrentGeneration(capturedGeneration)) return;
      if (await refreshAuthoritativeData(capturedGeneration)) {
        setCoverageNeedsRefresh(false);
        setMode('list');
        setSelectedCandidateId(undefined);
        setFeedback(undefined);
      } else if (isCurrentGeneration(capturedGeneration)) {
        setCoverageNeedsRefresh(true);
        setFeedback({ kind: 'success', message: 'The link was saved, but coverage could not be refreshed.', canRefresh: true });
      }
    } catch (mutationError) {
      if (!isCurrentGeneration(capturedGeneration)) return;
      const status = getScenarioManagementErrorStatus(mutationError);
      if (status === 409) {
        const refreshed = await refreshAuthoritativeData(capturedGeneration);
        if (!isCurrentGeneration(capturedGeneration)) return;
        setCoverageNeedsRefresh(!refreshed);
        setSelectedCandidateId(undefined);
        setFeedback({ kind: 'error', message: refreshed ? 'This scenario is already linked to the Spec. Coverage has been refreshed.' : 'This scenario may already be linked. Coverage could not be refreshed.', canRefresh: !refreshed });
      } else if (status === 404) {
        const refreshed = await refreshAuthoritativeData(capturedGeneration);
        if (!isCurrentGeneration(capturedGeneration)) return;
        setCoverageNeedsRefresh(!refreshed);
        setFeedback({ kind: 'error', message: refreshed ? 'The scenario or Spec is no longer available. Coverage has been refreshed.' : 'The scenario or Spec is no longer available, and coverage could not be refreshed.', canRefresh: !refreshed });
      } else {
        setCoverageNeedsRefresh(true);
        setFeedback({ kind: 'error', message: 'The link could not be confirmed. Refresh coverage before retrying.', canRefresh: true });
      }
    } finally {
      if (generation.current === capturedGeneration) {
        pendingWrite.current = false;
        setIsWritePending(false);
      }
    }
  };

  const openUnlinkConfirmation = (scenario: RelatedTestScenarioSummary) => {
    setConfirmScenario(scenario);
    setFeedback(undefined);
    setMode('unlink');
  };

  const cancelUnlink = () => {
    setMode('list');
    setFeedback(undefined);
    focusOnReturnRef.current = confirmScenario ? { scenarioId: confirmScenario.id } : null;
    setConfirmScenario(undefined);
  };

  const submitUnlink = async () => {
    if (!result || !confirmScenario || pendingWrite.current || coverageNeedsRefresh) return;
    pendingWrite.current = true;
    setFeedback(undefined);
    const capturedGeneration = generation.current;
    const scenario = confirmScenario;
    setIsWritePending(true);

    try {
      await unlinkScenario({ scenarioId: scenario.id, specId: result.spec.id, projectId }).unwrap();
      if (!isCurrentGeneration(capturedGeneration)) return;
      if (await refreshAuthoritativeData(capturedGeneration)) {
        setCoverageNeedsRefresh(false);
        setSelectedScenarioId((current) => (current === scenario.id ? undefined : current));
        setConfirmScenario(undefined);
        setMode('list');
        setFeedback(undefined);
      } else if (isCurrentGeneration(capturedGeneration)) {
        setCoverageNeedsRefresh(true);
        setFeedback({ kind: 'success', message: 'The link was removed, but coverage could not be refreshed.', canRefresh: true });
      }
    } catch (mutationError) {
      if (!isCurrentGeneration(capturedGeneration)) return;
      if (getScenarioManagementErrorStatus(mutationError) === 404) {
        const refreshed = await refreshAuthoritativeData(capturedGeneration);
        if (!isCurrentGeneration(capturedGeneration)) return;
        setCoverageNeedsRefresh(!refreshed);
        setFeedback({ kind: 'error', message: refreshed ? 'The scenario, Spec or link is no longer available. Coverage has been refreshed.' : 'The scenario, Spec or link is no longer available, and coverage could not be refreshed.', canRefresh: !refreshed });
      } else {
        setCoverageNeedsRefresh(true);
        setFeedback({ kind: 'error', message: 'The link could not be removed. Refresh coverage before retrying.', canRefresh: true });
      }
    } finally {
      if (generation.current === capturedGeneration) {
        pendingWrite.current = false;
        setIsWritePending(false);
      }
    }
  };

  const retryRefresh = async () => {
    const capturedGeneration = generation.current;
    const refreshed = await refreshAuthoritativeData(capturedGeneration);
    if (!isCurrentGeneration(capturedGeneration)) return;
    setCoverageNeedsRefresh(!refreshed);
    setFeedback(refreshed
      ? { kind: 'success', message: 'Coverage has been refreshed. You can retry the write explicitly.' }
      : { kind: 'error', message: 'Coverage could not be refreshed. Please try again.', canRefresh: true });
  };

  return {
    mode,
    result,
    error,
    errorStatus: getScenarioManagementErrorStatus(error),
    resultQuery,
    selectedScenario,
    confirmScenario,
    searchInput,
    appliedSearch,
    page,
    selectedCandidateId,
    feedback,
    isBusy: isWritePending,
    coverageNeedsRefresh,
    pickerQuery,
    candidates,
    linkedIds,
    totalPages,
    linkButtonRef,
    registerUnlinkButton: (scenarioId: string, element: HTMLButtonElement | null) => {
      if (element) unlinkButtonRefs.current.set(scenarioId, element);
      else unlinkButtonRefs.current.delete(scenarioId);
    },
    setSearchInput,
    setPage,
    selectCandidate: setSelectedCandidateId,
    inspectScenario: (scenarioId: string) => { setSelectedScenarioId(scenarioId); setMode('inspect'); },
    returnToList: () => setMode('list'),
    enterPicker,
    cancelPicker,
    applySearch,
    submitLink,
    openUnlinkConfirmation,
    cancelUnlink,
    submitUnlink,
    retryRefresh,
    fetchResultDetail: () => fetchResultDetail({ resultId, projectId }),
    isActive,
    isCurrentScope,
  };
};
