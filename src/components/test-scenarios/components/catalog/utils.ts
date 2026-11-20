// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { CatalogFolder, CatalogFolderRow } from './types';

export const CATALOG_TAB = { scenarios: 'scenarios', suites: 'suites' } as const;
export const CATALOG_SCOPE = { all: 'all', unfiled: 'unfiled', folder: 'folder', suite: 'suite' } as const;

export const SCENARIO_DRAG_MIME = 'application/x-testportal-scenarios';

export const getFolderChildren = (folder: CatalogFolder): CatalogFolder[] =>
  (folder.children ?? []).filter(
    (child): child is CatalogFolder => typeof child === 'object' && child !== null && 'id' in child && 'name' in child,
  );

export const flattenFolders = (folders: CatalogFolder[]): CatalogFolderRow[] => {
  const flattened: CatalogFolderRow[] = [];
  const visit = (folder: CatalogFolder, depth: number) => {
    flattened.push({ ...folder, depth });
    getFolderChildren(folder).forEach((child) => visit(child, depth + 1));
  };
  folders.forEach((folder) => visit(folder, 0));
  return flattened;
};

export type PriorityValue = 'high' | 'medium' | 'low';

export const priorityColors: Record<PriorityValue, { bg: string; color: string }> = {
  high: { bg: 'status.attention.bg', color: 'text.secondary' },
  medium: { bg: 'status.total.bg', color: 'text.secondary' },
  low: { bg: 'status.neutral.bg', color: 'text.secondary' },
};

export const shortAuthorName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || 'Unknown author';
  return `${parts[0]} ${parts.at(-1)?.[0] ?? ''}.`;
};

export const compactDate = (value: string) => new Date(value).toLocaleDateString('en-US');
export const authorInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const UNFILED_DESTINATION = '__unfiled__';
