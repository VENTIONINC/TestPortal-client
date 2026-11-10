// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export type ScenarioOrigin = { kind: 'all' | 'unfiled' } | { kind: 'folder' | 'suite'; id: string };

export const scenarioOriginSearch = (projectId: string, origin: ScenarioOrigin) => {
  const search = new URLSearchParams({ originProject: projectId, originKind: origin.kind });
  if ('id' in origin) search.set('originId', origin.id);
  return `?${search.toString()}`;
};

export const getScenarioOrigin = (search: URLSearchParams, projectId: string): ScenarioOrigin => {
  if (search.get('originProject') !== projectId) return { kind: 'all' };
  const kind = search.get('originKind');
  const id = search.get('originId')?.trim();
  if ((kind === 'folder' || kind === 'suite') && id) return { kind, id };
  if (kind === 'unfiled') return { kind };
  return { kind: 'all' };
};

export const scenarioOriginDestination = (
  projectId: string,
  origin: ScenarioOrigin,
  folders: Array<{ id: string; name: string }>,
  suites: Array<{ id: string; name: string }>,
) => {
  const search = new URLSearchParams({ projectId });
  let label = 'All scenarios';
  if (origin.kind === 'unfiled') {
    search.set('folderId', 'unfiled');
    label = 'No folder';
  } else if (origin.kind === 'folder') {
    const folder = folders.find(({ id }) => id === origin.id);
    if (folder) { search.set('folderId', folder.id); label = folder.name; }
  } else if (origin.kind === 'suite') {
    const suite = suites.find(({ id }) => id === origin.id);
    if (suite) { search.set('tab', 'suites'); search.set('suiteId', suite.id); label = suite.name; }
  }
  return { path: `/test-management?${search}`, label };
};
