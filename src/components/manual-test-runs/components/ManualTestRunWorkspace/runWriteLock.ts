// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useSyncExternalStore } from 'react';

const pendingWrites = new Set<string>();
const listeners = new Set<() => void>();
const key = (projectId: string, runId: string) => JSON.stringify([projectId, runId]);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const tryStartRunWrite = (projectId: string, runId: string) => {
  const id = key(projectId, runId);
  if (pendingWrites.has(id)) return false;

  pendingWrites.add(id);
  listeners.forEach((listener) => listener());
  return true;
};

export const finishRunWrite = (projectId: string, runId: string) => {
  if (pendingWrites.delete(key(projectId, runId))) listeners.forEach((listener) => listener());
};

export const useRunWritePending = (projectId: string, runId: string) =>
  useSyncExternalStore(subscribe, () => pendingWrites.has(key(projectId, runId)));
