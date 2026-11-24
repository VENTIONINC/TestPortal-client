// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Link as ChakraLink, Table, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

import { Tooltip } from '@/components/ui';

import { TagChips } from '../../tags/TagChips';
import { getTestScenarioDetailPath } from '../../constants';
import type { TestScenarioSummary } from '../../types';
import { authorInitials, compactDate, priorityColors, shortAuthorName } from './utils';

export const ScenarioSummaryHeaders = ({ showFolder = true }: { showFolder?: boolean }) => (
  <>
    <Table.ColumnHeader w="80px">Key</Table.ColumnHeader>
    <Table.ColumnHeader>Title</Table.ColumnHeader>
    <Table.ColumnHeader w="78px">Priority</Table.ColumnHeader>
    {showFolder && <Table.ColumnHeader w="116px">Folder</Table.ColumnHeader>}
    <Table.ColumnHeader w="140px">Tags</Table.ColumnHeader>
    <Table.ColumnHeader w="130px">Author</Table.ColumnHeader>
    <Table.ColumnHeader w="80px">Updated</Table.ColumnHeader>
  </>
);

interface ScenarioSummaryCellsProps {
  scenario: TestScenarioSummary;
  originSearch: string;
  folderPathById: Map<string, string>;
  showFolder?: boolean;
  unfiledLabel: string;
}
export const ScenarioSummaryCells = ({
  scenario,
  originSearch,
  folderPathById,
  showFolder = true,
  unfiledLabel,
}: ScenarioSummaryCellsProps) => {
  const folderPath = scenario.folderId
    ? (folderPathById.get(scenario.folderId) ?? scenario.folderName ?? 'Unknown folder')
    : unfiledLabel;
  const fullAuthor = scenario.createdBy.name
    ? `${scenario.createdBy.name} (${scenario.createdBy.email})`
    : scenario.createdBy.email || 'Unknown author';
  const priority = scenario.priority;
  const priorityStyle = priority ? priorityColors[priority] : undefined;

  const author = scenario.createdBy.name || scenario.createdBy.email || 'Unknown author';
  const date = new Date(scenario.updatedAt);
  return (
    <>
      <Table.Cell>
        <Tooltip content={scenario.scenarioKey ?? 'N/A'}>
          <Text tabIndex={0} display="block" maxW="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {scenario.scenarioKey ?? 'N/A'}
          </Text>
        </Tooltip>
      </Table.Cell>
      <Table.Cell minW={0} overflow="hidden">
        <Tooltip content={scenario.title}>
          <ChakraLink
            asChild
            display="block"
            minW={0}
            maxW="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontWeight="semibold"
            color="text.main"
          >
            <RouterLink to={`${getTestScenarioDetailPath(scenario.id)}${originSearch}`}>{scenario.title}</RouterLink>
          </ChakraLink>
        </Tooltip>
      </Table.Cell>
      <Table.Cell>
        {priority ? (
          <Text
            as="span"
            display="inline-flex"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            bg={priorityStyle?.bg}
            color={priorityStyle?.color}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Text>
        ) : (
          <Text color="text.muted">—</Text>
        )}
      </Table.Cell>
      {showFolder && (
        <Table.Cell>
          <Tooltip content={folderPath}>
            <Text
              tabIndex={0}
              display="block"
              maxW="100%"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {folderPath}
            </Text>
          </Tooltip>
        </Table.Cell>
      )}
      <Table.Cell>
        <TagChips tags={scenario.tags ?? []} limit={2} />
      </Table.Cell>
      <Table.Cell>
        <Tooltip content={fullAuthor}>
          <HStack tabIndex={0} gap={1} minW={0}>
            <Box
              aria-hidden="true"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w="6"
              h="6"
              flexShrink={0}
              borderRadius="full"
              bg="blue.subtle"
              color="blue.fg"
              fontSize="xs"
              fontWeight="semibold"
            >
              {authorInitials(scenario.createdBy.name)}
            </Box>
            <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {shortAuthorName(scenario.createdBy.name)}
            </Text>
          </HStack>
        </Tooltip>
      </Table.Cell>
      <Table.Cell whiteSpace="nowrap" color="text.secondary">
        <Tooltip content={`${date.toLocaleDateString('en-US', { dateStyle: 'long' })} · ${author}`}>
          <Text as="time" tabIndex={0} fontSize="xs">
            {compactDate(date)}
          </Text>
        </Tooltip>
      </Table.Cell>
    </>
  );
};
