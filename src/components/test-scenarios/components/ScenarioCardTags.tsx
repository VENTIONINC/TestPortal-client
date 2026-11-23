// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

import {
  generatedApi,
  type PutApiV2ProjectsByProjectIdScenarioTagsAssignmentApiArg,
  type ScenarioTagSummary,
  usePutApiV2ProjectsByProjectIdScenarioTagsAssignmentMutation,
} from '@/redux/apis/generatedApi';
import { useAppDispatch } from '@/redux/hooks';

import { tagError } from '../tags/tagUtils';
import { TagChips, TagPicker } from '../tags';

interface ScenarioCardTagsProps {
  projectId: string;
  tags: ScenarioTagSummary[];
  disabled?: boolean;
  onToggle: (tag: ScenarioTagSummary, present: boolean) => void | Promise<void>;
  onCreate: (name: string) => Promise<void>;
}

export function ScenarioCardTags({ projectId, tags, disabled, onToggle, onCreate }: ScenarioCardTagsProps) {
  const [error, setError] = useState('');
  const remove = async (tag: ScenarioTagSummary) => {
    setError('');
    try {
      await onToggle(tag, false);
    } catch (failure) {
      setError(tagError(failure));
    }
  };
  return (
    <Box>
      <Text fontSize="sm" mb={2}>
        Tags
      </Text>
      <HStack wrap="wrap" gap={2}>
        <TagChips tags={tags} emptyLabel="No tags" disabled={disabled} onRemove={remove} />
        <TagPicker
          projectId={projectId}
          selectedIds={tags.map(({ id }) => id)}
          disabled={disabled}
          onToggle={onToggle}
          onCreate={onCreate}
        />
      </HStack>
      {error && (
        <Text role="alert" fontSize="sm" color="fg.error">
          {error}
        </Text>
      )}
    </Box>
  );
}

export function SavedScenarioCardTags({
  scenarioId,
  projectId,
  tags,
  disabled,
  onAssigned,
}: Pick<ScenarioCardTagsProps, 'projectId' | 'tags' | 'disabled'> & { scenarioId: string; onAssigned?: () => void }) {
  const [assignTag, { isLoading }] = usePutApiV2ProjectsByProjectIdScenarioTagsAssignmentMutation();
  const dispatch = useAppDispatch();
  const assign = async (body: PutApiV2ProjectsByProjectIdScenarioTagsAssignmentApiArg['body']) => {
    const tag = await assignTag({ projectId, body }).unwrap();
    dispatch(
      generatedApi.util.updateQueryData('getApiV2TestScenariosByScenarioId', { projectId, scenarioId }, (scenario) => {
        const current = scenario.tags ?? [];
        if (!body.present) scenario.tags = current.filter(({ id }) => id !== tag.id);
        else if (!current.some(({ id }) => id === tag.id)) scenario.tags = [...current, tag];
      }),
    );
    onAssigned?.();
  };
  return (
    <ScenarioCardTags
      projectId={projectId}
      tags={tags}
      disabled={disabled || isLoading}
      onToggle={(tag, present) => assign({ tagId: tag.id, scenarioIds: [scenarioId], present })}
      onCreate={(name) => assign({ name, scenarioIds: [scenarioId], present: true })}
    />
  );
}
