// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import {
  type ScenarioTagSummary,
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery,
  usePostApiV2ProjectsByProjectIdScenarioTagsInlineMutation,
} from '@/redux/apis/generatedApi';

export function useScenarioDraftTags(projectId: string, initial: ScenarioTagSummary[]) {
  const directory = useGetApiV2ProjectsByProjectIdScenarioTagsQuery({ projectId });
  const [inline, { isLoading }] = usePostApiV2ProjectsByProjectIdScenarioTagsInlineMutation();
  const [selection, setSelection] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [created, setCreated] = useState<{
    tags: ScenarioTagSummary[];
    previousDirectory?: typeof directory.currentData;
  }>();
  // The inline response can precede the tag directory refresh. Keep the returned tag
  // selectable during that interval, then defer to the directory for edits and deletions.
  const directoryTags = directory.currentData;
  const tagsById = new Map<string, ScenarioTagSummary>();
  if (created && created.previousDirectory === directoryTags) {
    for (const tag of created.tags) tagsById.set(tag.id, tag);
  }
  for (const tag of directoryTags ?? []) tagsById.set(tag.id, tag);
  const tags = directoryTags
    ? selection.map(({ id }) => tagsById.get(id)).filter((tag) => tag !== undefined)
    : selection;
  const baselineIds = new Set(baseline.filter(({ id }) => !directoryTags || tagsById.has(id)).map(({ id }) => id));
  const dirty = tags.length !== baselineIds.size || tags.some(({ id }) => !baselineIds.has(id));
  const toggle = (tag: ScenarioTagSummary, present: boolean) => {
    setSelection((current) =>
      present
        ? current.some(({ id }) => id === tag.id)
          ? current
          : [...current, tag]
        : current.filter(({ id }) => id !== tag.id),
    );
  };
  const create = async (name: string) => {
    const tag = await inline({ projectId, body: { name } }).unwrap();
    setCreated((previous) => ({
      tags: previous?.previousDirectory === directory.currentData ? [...(previous?.tags ?? []), tag] : [tag],
      previousDirectory: directory.currentData,
    }));
    toggle(tag, true);
  };
  const retain = (saved: ScenarioTagSummary[]) => {
    setSelection(saved);
    setBaseline(saved);
  };
  return { tags, dirty, isLoading, toggle, create, retain };
}
