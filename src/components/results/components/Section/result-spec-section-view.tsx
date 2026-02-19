import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { LuFileText, LuTag } from 'react-icons/lu';

import { ClipboardCopyText, DateToggle } from '@/components/ui';
import { toCleanTitle } from '@/utils/date-time.converter';
import { useSurfaceColors } from '@/theme';

import { ResultsExecutionCard } from '../ExecutionCard';
import { ResultSpecSectionViewProps } from './types';

export const ResultSpecSectionView = ({
  specKey,
  specFile,
  specTitle,
  specTags,
  sectionDays,
  handleDateToggle,
  projectId,
  onTagClick,
  onExecutionContextMenu,
  onResultContextMenu,
}: ResultSpecSectionViewProps) => {
  const { surfaces, borders, text, states } = useSurfaceColors();

  return (
    <VStack align="stretch" m={4} p={2} shadow="card" bg="bg.cardSecondary" borderRadius="md">
      <HStack overflowX="auto" pb={2}>
        <DateToggle days={sectionDays} toggleHandler={handleDateToggle} variant="stats" />
      </HStack>

      <VStack gap={1} align="stretch" py={1} px={1}>
        <Flex gap={4} textStyle="sm">
          <ClipboardCopyText value={specKey}>{specKey}</ClipboardCopyText>
          <ClipboardCopyText value={specFile}>{specFile}</ClipboardCopyText>

          <Flex ms="auto" flexWrap="wrap" gap={2}>
            {specTags?.map((tag) => (
              <HStack
                key={tag}
                px={2}
                border="1px solid"
                borderColor={borders.subtle}
                borderRadius="sm"
                onClick={() => onTagClick(tag)}
                cursor="pointer"
                _hover={{ bg: states.hoverSubtle }}
              >
                <LuTag size={12} />
                <Text textStyle="sm" color={text.primary}>
                  {tag}
                </Text>
              </HStack>
            ))}
          </Flex>
        </Flex>

        <div className="row spec-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <HStack align="center" textStyle="sm">
            <LuFileText size={16} />
            <ClipboardCopyText value={toCleanTitle(specTitle)}>{toCleanTitle(specTitle)}</ClipboardCopyText>
          </HStack>
        </div>
      </VStack>

      {sectionDays.map(
        ({ execution, results, serialized, isActive }) =>
          isActive &&
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
};
