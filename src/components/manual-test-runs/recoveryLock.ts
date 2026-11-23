// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useSyncExternalStore } from 'react';

const lockedRuns = new Map<string, boolean>();
const listeners = new Set<() => void>();
const key = (projectId: string, runId: string) => JSON.stringify([projectId, runId]);
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const notify = () => listeners.forEach((listener) => listener());

export const lockRunRecovery = (projectId: string, runId: string, rejected = false) => {
  const id = key(projectId, runId);
  lockedRuns.set(id, Boolean(lockedRuns.get(id)) || rejected);
  notify();
};
export const unlockRunRecovery = (projectId: string, runId: string) => {
  lockedRuns.delete(key(projectId, runId));
  notify();
};
export const isRunRecoveryLocked = (projectId: string, runId: string) => lockedRuns.has(key(projectId, runId));
export const wasRunChangeRejected = (projectId: string, runId: string) => lockedRuns.get(key(projectId, runId)) === true;
export const useRunRecoveryLocked = (projectId: string, runId: string) =>
  useSyncExternalStore(subscribe, () => isRunRecoveryLocked(projectId, runId));
