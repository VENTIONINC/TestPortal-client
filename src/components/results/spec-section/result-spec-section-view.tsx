import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { LuFileText, LuTag } from 'react-icons/lu';

import { ClipboardCopyText } from '@/components/ui';
import { ResultsExecutionCard } from '@/components/results';
import { toCleanTitle } from '@/utils/date-time.converter';
import { useSurfaceColors } from '@/theme';

import { DateToggle } from './date-toggle';
import { ResultSpecSectionViewProps } from './types';

export const ResultSpecSectionView = ({
  specKey,
  specFile,
  specTitle,
  specTags,
  dateFilters,
  filteredExecutions,
  projectId,
  onDateToggle,
  onTagClick,
  onExecutionContextMenu,
  onResultContextMenu,
}: ResultSpecSectionViewProps) => {
  const { surfaces, borders, text, states } = useSurfaceColors();

  return (
    <VStack align="stretch" p={2} bg={surfaces.panel} shadow="md" borderRadius="md">
      <HStack overflowX="auto" pb={2}>
        {dateFilters.map((day) => (
          <DateToggle key={day.yyyy_mm_dd} day={day} toggleHandler={onDateToggle} />
        ))}
      </HStack>

      <VStack
        gap={1}
        align="stretch"
        bg={surfaces.card}
        py={2}
        px={4}
        border="1px solid"
        borderColor={borders.subtle}
        borderRadius="md"
      >
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

      {filteredExecutions.map(({ execution, results, serialized }) => (
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
      ))}
    </VStack>
  );
};
