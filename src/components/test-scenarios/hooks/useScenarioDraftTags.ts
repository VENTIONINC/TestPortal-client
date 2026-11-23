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
  const currentTag = (tag: ScenarioTagSummary) =>
    directory.currentData
      ? (directory.currentData.find(({ id }) => id === tag.id) ??
        (created?.previousDirectory === directory.currentData
          ? created?.tags.find(({ id }) => id === tag.id)
          : undefined))
      : tag;
  const tags = selection.map(currentTag).filter((tag): tag is ScenarioTagSummary => Boolean(tag));
  const visibleBaseline = baseline.map(currentTag).filter((tag) => tag !== undefined);
  const dirty =
    tags.length !== visibleBaseline.length || tags.some((tag) => !visibleBaseline.some(({ id }) => id === tag.id));
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
