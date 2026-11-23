// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useId } from 'react';
import { Box, Button, HStack, Input, Text } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

import { useGetApiV2ManualTestRunsQuery } from '@/redux/apis/generatedApi';
import type { ManualTestRunEnvironmentProperty } from '@/redux/apis/generatedApi';

const names = ['Environment', 'Browser', 'OS', 'Device', 'Build'];

interface ManualRunEnvironmentEditorProps {
  projectId: string;
  environment: ManualTestRunEnvironmentProperty[];
  onEnvironmentChange: (items: ManualTestRunEnvironmentProperty[]) => void;
  sourceRunTitle?: string;
}

export function ManualRunEnvironmentEditor({
  projectId,
  environment,
  onEnvironmentChange,
  sourceRunTitle,
}: ManualRunEnvironmentEditorProps) {
  const runs = useGetApiV2ManualTestRunsQuery({ projectId, page: 1, limit: 100, show: 'all', period: 'any_time' });
  const listId = useId();
  const updateProperty = (index: number, key: 'name' | 'value', value: string) =>
    onEnvironmentChange(environment.map((item, row) => (row === index ? { ...item, [key]: value } : item)));
  const suggestions = [
    ...new Set([
      ...names,
      ...(runs.currentData?.runs ?? []).flatMap((run) => run.environmentProperties.map((item) => item.name)),
    ]),
  ];
  return (
    <Box>
      <HStack justify="space-between" mb={2} flexWrap="wrap">
        <Text fontSize="sm" color="fg.muted">
          Environment (optional)
        </Text>
        {sourceRunTitle && environment.length > 0 && (
          <Text fontSize="sm" color="fg.muted">
            Copied from “{sourceRunTitle}”, build left empty ·{' '}
            <Button variant="plain" size="sm" colorPalette="blue" px={0} onClick={() => onEnvironmentChange([])}>
              Clear
            </Button>
          </Text>
        )}
      </HStack>
      <datalist id={`${listId}-names`}>
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      {environment.map((item, index) => {
        const duplicate =
          item.name.trim() &&
          environment.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) !== index;
        const values = [
          ...new Set(
            (runs.currentData?.runs ?? []).flatMap((run) =>
              run.environmentProperties
                .filter((property) => property.name.trim().toLowerCase() === item.name.trim().toLowerCase())
                .map((property) => property.value),
            ),
          ),
        ];
        return (
          <Box key={index} mb={2}>
            <HStack>
              <Input
                flex="2"
                aria-label={`Property ${index + 1} name`}
                list={`${listId}-names`}
                placeholder="Name"
                value={item.name}
                onChange={(event) => updateProperty(index, 'name', event.target.value)}
              />
              <Input
                flex="3"
                aria-label={`Property ${index + 1} value`}
                list={`${listId}-values-${index}`}
                placeholder={item.name.trim().toLowerCase() === 'build' ? 'e.g. 2.4.2' : 'Value'}
                value={item.value}
                onChange={(event) => updateProperty(index, 'value', event.target.value)}
              />
              <datalist id={`${listId}-values-${index}`}>
                {values.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
              <Button
                aria-label={`Remove property ${index + 1}`}
                size="sm"
                w="32px"
                minW="32px"
                h="32px"
                p={0}
                variant="ghost"
                onClick={() => onEnvironmentChange(environment.filter((_, row) => row !== index))}
              >
                <FiX />
              </Button>
            </HStack>
            {duplicate && (
              <Text role="alert" color="fg.error" fontSize="sm">
                This property name is already used. The first value will be kept.
              </Text>
            )}
          </Box>
        );
      })}
      <HStack flexWrap="wrap">
        <Button
          size="sm"
          variant="outline"
          color="fg.muted"
          borderStyle="dashed"
          borderRadius="full"
          onClick={() => onEnvironmentChange([...environment, { name: '', value: '' }])}
        >
          + Add property
        </Button>
        {names
          .filter(
            (suggestion) => !environment.some((item) => item.name.trim().toLowerCase() === suggestion.toLowerCase()),
          )
          .map((suggestion) => (
            <Button
              key={suggestion}
              size="sm"
              variant="outline"
              color="fg.muted"
              borderRadius="full"
              onClick={() => onEnvironmentChange([...environment, { name: suggestion, value: '' }])}
            >
              + {suggestion}
            </Button>
          ))}
      </HStack>
    </Box>
  );
}
