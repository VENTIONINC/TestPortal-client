// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { LuFileText } from 'react-icons/lu';

import { ClipboardCopyText, DateToggle, Tooltip } from '@/components/ui';
import { FilterTag } from '@/components/ui/components';
import { toCleanTitle } from '@/utils/date-time.converter';

import { ResultsExecutionCard } from '../ExecutionCard';
import { ResultSpecSectionViewProps } from './types';

export const ResultSpecSectionView = memo(
  ({
    specKey,
    specFile,
    specTitle,
    specTags,
    sectionDays,
    handleDateToggle,
    projectId,
    onExecutionContextMenu,
    onResultContextMenu,
    activeTags,
    onToggleTag,
  }: ResultSpecSectionViewProps) => {
    const cleanSpecTitle = toCleanTitle(specTitle);

    return (
      <VStack
        align="stretch"
        minW={0}
        shadow="card"
        bg="bg.cardSecondary"
        mx={4}
        p={4}
        border="1px solid"
        borderColor="border.main"
        borderRadius="md"
      >
        <HStack overflowX="auto" pb={2}>
          <DateToggle days={sectionDays} toggleHandler={handleDateToggle} variant="stats" />
        </HStack>

        <VStack gap={1} align="stretch" minW={0}>
          <Flex gap={4} textStyle="sm" p={2} flexWrap="wrap" alignItems="center">
            <ClipboardCopyText value={specKey}>
              <Tooltip content={specKey}>
                <Text maxW="100px" truncate>
                  {specKey}
                </Text>
              </Tooltip>
            </ClipboardCopyText>
            <ClipboardCopyText value={specFile} mr={{ base: 0, md: 6 }}>
              <Tooltip content={specFile}>
                <Text maxW={{ base: '200px', md: '300px' }} truncate direction="rtl" textAlign="left">
                  {specFile}
                </Text>
              </Tooltip>
            </ClipboardCopyText>

            <Flex ms={{ base: '0', md: 'auto' }} flexWrap="wrap" gap={2}>
              {specTags?.map((tag) => {
                const isSelected = activeTags.includes(tag);

                return <FilterTag key={tag} tag={tag} isSelected={isSelected} onClick={() => onToggleTag(tag)} />;
              })}
            </Flex>
          </Flex>

          <HStack align="center" textStyle="sm" minW={0} w="full">
            <ClipboardCopyText
              value={cleanSpecTitle}
              display="grid"
              gridTemplateColumns="auto minmax(0, 1fr)"
              alignItems="center"
              gap={2.5}
              borderRadius="sm"
              _hover={{ bg: 'bg.active' }}
              p={2}
              minW={0}
              w="full"
            >
              <LuFileText size={16} style={{ flexShrink: 0 }} />
              <Tooltip content={cleanSpecTitle}>
                <Text as="span" data-testid="spec-title" truncate minW={0}>
                  {cleanSpecTitle}
                </Text>
              </Tooltip>
            </ClipboardCopyText>
          </HStack>
        </VStack>

        {sectionDays.map(
          ({ execution, results, serialized, isVisible }) =>
            isVisible &&
            execution &&
            serialized && (
              <ResultsExecutionCard
                key={execution.id}
                results={results}
                specName={specTitle}
                projectId={projectId}
                onContextMenu={(evt) =>
                  onExecutionContextMenu(evt, {
                    id: execution.id,
                    name: execution.name,
                    projectId: projectId,
                  })
                }
                onResultContextMenu={onResultContextMenu}
                {...serialized}
              />
            ),
        )}
      </VStack>
    );
  },
);
