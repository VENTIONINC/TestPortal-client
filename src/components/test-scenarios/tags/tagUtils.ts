// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { ScenarioTagSummary } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';

export function matchingTags<T extends ScenarioTagSummary>(tags: T[], query: string): T[] {
  const search = query.trim().toLocaleLowerCase();
  return tags.filter(
    (tag) => tag.name.toLocaleLowerCase().includes(search) || tag.description.toLocaleLowerCase().includes(search),
  );
}

export function tagError(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : cause && typeof cause === 'object' && 'status' in cause
      ? extractApiError(cause as FetchBaseQueryError)
      : 'Could not update tags. Please try again.';
}

export function toggleTag(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

// A dialog may be opened from another control (for example the bulk bar).
// Each mounted filter retains its own removed selection until the dialog retires Undo.
type FilterListener = (projectId: string, deleted: string[]) => (() => void) | undefined;
const listeners = new Set<FilterListener>();

export function subscribeToTagDeletion(listener: FilterListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function removeDeletedFilters(projectId: string, deleted: string[]) {
  const restore = Array.from(listeners, (listener) => listener(projectId, deleted));
  return () => restore.forEach((callback) => callback?.());
}
