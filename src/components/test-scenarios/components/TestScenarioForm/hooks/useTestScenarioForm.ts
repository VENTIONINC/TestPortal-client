// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useForm } from 'react-hook-form';

import { testScenarioAuthoringSchema, type TestScenarioAuthoringFormData } from '@/schemas';

import type { TestScenarioFormProps, ScenarioSuiteDraft } from '../TestScenarioForm';
import { useScenarioFolderPicker } from './useScenarioFolderPicker';
import { useScenarioTextareaAutosize } from './useScenarioTextareaAutosize';
import type { TestScenarioInitialStepDraft } from '../../../types';

const EMPTY_STEPS: TestScenarioInitialStepDraft[] = [];
const EMPTY_SUITES: ScenarioSuiteDraft[] = [];
let draftSequence = 0;
const newStep = (): TestScenarioInitialStepDraft => ({
  key: `draft-${++draftSequence}`,
  action: '',
  expectedResult: '',
});
const toValues = (values: TestScenarioFormProps['initialValues']) => ({
  title: values?.title ?? '',
  details: values?.details ?? '',
  priority: values?.priority || ('medium' as const),
  preconditions: values?.preconditions ?? '',
  testData: values?.testData ?? '',
  relatedIssueUrl: values?.relatedIssueUrl ?? '',
});

export const useTestScenarioForm = ({
  mode,
  initialValues,
  initialSteps = EMPTY_STEPS,
  initialSuites = EMPTY_SUITES,
  draftTagsDirty = false,
  reconciliation,
  createAnotherReset,
  focusTitle = false,
  isSubmitting = false,
  folders = [],
  initialFolderId = null,
  onDirtyChange,
  onSubmit,
  onCancel,
}: Pick<
  TestScenarioFormProps,
  | 'mode'
  | 'initialValues'
  | 'initialSteps'
  | 'initialSuites'
  | 'draftTagsDirty'
  | 'reconciliation'
  | 'createAnotherReset'
  | 'focusTitle'
  | 'isSubmitting'
  | 'folders'
  | 'initialFolderId'
  | 'onDirtyChange'
  | 'onSubmit'
  | 'onCancel'
>) => {
  const [steps, setSteps] = useState(() =>
    initialSteps.length ? initialSteps : mode === 'create' ? [newStep(), newStep(), newStep()] : [],
  );
  const { folderId, setFolderId, ...folderPicker } = useScenarioFolderPicker(initialFolderId, folders);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [selectedSuites, setSelectedSuites] = useState(initialSuites);
  const [createAnother, setCreateAnother] = useState(false);
  const [createdConfirmation, setCreatedConfirmation] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState('');
  const [grabbed, setGrabbed] = useState<string>();
  const [draggedStep, setDraggedStep] = useState<string>();
  const [dropTarget, setDropTarget] = useState<string>();
  const dropTargetRef = useRef<string | undefined>(undefined);
  const pickedUpOrder = useRef<string[]>([]);
  const [focusStep, setFocusStep] = useState<string>();
  const [focusHandle, setFocusHandle] = useState<string>();
  const root = useRef<HTMLFormElement>(null);
  const pointer = useRef<{ key: string; id: number } | null>(null);
  const baseline = useRef({ steps: initialSteps, suites: initialSuites, folderId: initialFolderId });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: submitting, isDirty },
  } = useForm<TestScenarioAuthoringFormData>({
    resolver: zodResolver(testScenarioAuthoringSchema),
    defaultValues: toValues(initialValues),
    mode: 'onChange',
  });
  const values = watch();
  const pending = submitting || isSubmitting;
  useEffect(() => {
    if (!focusTitle) return;
    const title = root.current?.querySelector<HTMLInputElement>('input[name="title"]');
    title?.focus();
    title?.select();
  }, [focusTitle]);
  const meaningfulSteps = steps.filter((s) => s.id || s.action.trim() || s.expectedResult.trim());
  const dirty =
    isDirty ||
    draftTagsDirty ||
    folderId !== baseline.current.folderId ||
    JSON.stringify(meaningfulSteps) !== JSON.stringify(baseline.current.steps) ||
    JSON.stringify(selectedSuites) !== JSON.stringify(baseline.current.suites);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (!reconciliation) return;
    reset(toValues(reconciliation.values));
    setSteps(initialSteps);
    setSelectedSuites(initialSuites);
    setFolderId(initialFolderId);
    baseline.current = { steps: initialSteps, suites: initialSuites, folderId: initialFolderId };
    setStepErrors({});
    // Only an explicit save/reload token may replace an active draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconciliation?.token, reset]);
  useEffect(() => {
    if (!createAnotherReset) return;
    reset({ ...toValues(undefined), priority: values.priority });
    setSteps([newStep(), newStep(), newStep()]);
    setSelectedSuites(createAnotherReset.suites);
    baseline.current = { steps: [], suites: createAnotherReset.suites, folderId };
    setStepErrors({});
    setCreatedConfirmation(true);
    // Reset only after a confirmed create, not while editing the next draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createAnotherReset?.token, reset]);
  useScenarioTextareaAutosize(root, steps, values);
  useEffect(() => {
    if (focusStep) {
      root.current?.querySelector<HTMLTextAreaElement>(`[data-action-key="${focusStep}"]`)?.focus();
      setFocusStep(undefined);
    }
    if (focusHandle) {
      root.current?.querySelector<HTMLButtonElement>(`[data-handle-key="${focusHandle}"]`)?.focus();
      setFocusHandle(undefined);
    }
  }, [focusStep, focusHandle, steps]);
  const append = () => {
    if (pending) return;
    let step = newStep();
    while (steps.some((existing) => existing.key === step.key)) step = newStep();
    setSteps((previous) => [...previous, step]);
    setFocusStep(step.key);
  };
  const move = (key: string, target: number) => {
    if (pending) return;
    setSteps((previous) => {
      const from = previous.findIndex((s) => s.key === key);
      if (from < 0 || target < 0 || target >= previous.length || target === from) return previous;
      const next = [...previous];
      next.splice(target, 0, next.splice(from, 1)[0]);
      setAnnouncement(`Step moved to position ${target + 1} of ${next.length}`);
      return next;
    });
    setFocusHandle(key);
  };
  const update = (key: string, field: 'action' | 'expectedResult', value: string) => {
    setSteps((previous) => previous.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
    setStepErrors((previous) => ({ ...previous, [key]: '' }));
  };
  const submit = (data: TestScenarioAuthoringFormData) => {
    if (pending) return;
    const invalid = Object.fromEntries(
      meaningfulSteps.filter((s) => !s.action.trim()).map((s) => [s.key, 'Step action is required']),
    );
    setStepErrors(invalid);
    if (Object.keys(invalid).length) return;
    return onSubmit(
      data,
      meaningfulSteps,
      folderId,
      {
        suiteIds: selectedSuites.filter((s) => !s.isNew).map((s) => s.id),
        newSuites: selectedSuites.filter((s) => s.isNew).map(({ name }) => ({ name })),
      },
      createAnother,
    );
  };
  const cancel = () => onCancel(folderId);
  const getStepReorderHandlers = (step: TestScenarioInitialStepDraft, index: number) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (pending) return;
      pointer.current = { key: step.key, id: e.pointerId };
      setDraggedStep(step.key);
      dropTargetRef.current = step.key;
      setDropTarget(step.key);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
      if (pointer.current?.key !== step.key) return;
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-step-key]');
      const key = target?.getAttribute('data-step-key');
      if (key) {
        dropTargetRef.current = key;
        setDropTarget(key);
      }
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      if (dropTargetRef.current)
        move(
          step.key,
          steps.findIndex((s) => s.key === dropTargetRef.current),
        );
      pointer.current = null;
      setDraggedStep(undefined);
      setDropTarget(undefined);
      dropTargetRef.current = undefined;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    },
    onPointerCancel: () => {
      pointer.current = null;
      setDraggedStep(undefined);
      setDropTarget(undefined);
      dropTargetRef.current = undefined;
    },
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (grabbed !== step.key) pickedUpOrder.current = steps.map((row) => row.key);
        setGrabbed(grabbed === step.key ? undefined : step.key);
        setAnnouncement(grabbed === step.key ? 'Step dropped' : `Step ${index + 1} picked up`);
      } else if (grabbed === step.key && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        move(step.key, index + (e.key === 'ArrowUp' ? -1 : 1));
      } else if (e.key === 'Escape' && grabbed === step.key) {
        e.preventDefault();
        setSteps((current) => {
          const order = new Map(pickedUpOrder.current.map((key, position) => [key, position]));
          return [...current].sort(
            (left, right) => (order.get(left.key) ?? current.length) - (order.get(right.key) ?? current.length),
          );
        });
        setGrabbed(undefined);
        setFocusHandle(step.key);
        setAnnouncement('Reordering cancelled');
      }
    },
  });
  return {
    root,
    register,
    handleSubmit,
    submit,
    createdConfirmation,
    setCreatedConfirmation,
    pending,
    errors,
    steps,
    draggedStep,
    dropTarget,
    grabbed,
    getStepReorderHandlers,
    stepErrors,
    update,
    append,
    setSteps,
    announcement,
    createAnother,
    setCreateAnother,
    cancel,
    folderId,
    values,
    priorityOpen,
    setPriorityOpen,
    setValue,
    selectedSuites,
    setSelectedSuites,
    folderPicker,
  };
};
