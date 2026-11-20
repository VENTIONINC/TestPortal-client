// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, HStack, Input, Text } from '@chakra-ui/react';
import { LuFlag, LuMessageSquare, LuX } from 'react-icons/lu';

import { Tooltip } from '@/components/ui';
import type { ManualTestRunScenarioStepRead } from '@/redux/apis/generatedApi';

import { resultColors } from './resultColors';

export interface StepDraft {
  comment: string;
  failedFlag: boolean;
  failedComment: string;
  blockedFlag: boolean;
  blockedComment: string;
}

type StepFlag = 'failed' | 'blocked';

interface ManualRunScenarioStepProps {
  step: ManualTestRunScenarioStepRead;
  stepNumber: number;
  draft: StepDraft;
  flagKind: StepFlag | null;
  flagged: boolean;
  commentOpen: boolean;
  completed: boolean;
  onUpdate: (patch: Partial<StepDraft>) => void;
  onToggleFlag: () => void;
  onOpenComment: () => void;
  onClearComment: () => void;
}

export function ManualRunScenarioStep({
  step,
  stepNumber,
  draft,
  flagKind,
  flagged,
  commentOpen,
  completed,
  onUpdate,
  onToggleFlag,
  onOpenComment,
  onClearComment,
}: ManualRunScenarioStepProps) {
  const flagTooltip =
    flagKind === 'failed' ? 'Mark this step as the one that failed' : 'Mark this step as the one that got blocked';

  return (
    <Box
      boxShadow={
        flagged
          ? `inset 2px 0 ${flagKind === 'blocked' ? 'var(--chakra-colors-orange-500)' : 'var(--chakra-colors-red-500)'}`
          : undefined
      }
      pl={0}
      py={3}
    >
      <Box
        display="grid"
        gridTemplateColumns="30px minmax(0, calc(50% - 21px)) minmax(0, 1fr) 64px"
        gap={3}
        alignItems="start"
        fontSize="sm"
      >
        <Text color="fg.muted" pl={3}>
          {stepNumber}
        </Text>
        <Text whiteSpace="pre-wrap">{step.action}</Text>
        <Text whiteSpace="pre-wrap">{step.expectedResult || '—'}</Text>
        <HStack gap={1} justify="end">
          {flagKind && !completed && !commentOpen && (
            <Tooltip content={flagTooltip}>
              <Button
                size="xs"
                variant={flagged ? 'subtle' : 'ghost'}
                colorPalette={resultColors[flagKind]}
                aria-label={`${flagTooltip} (${stepNumber})`}
                aria-pressed={flagged}
                w="28px"
                h="28px"
                minW="28px"
                p={0}
                onClick={onToggleFlag}
              >
                <LuFlag />
              </Button>
            </Tooltip>
          )}
          {!completed && !flagged && !commentOpen && (
            <Tooltip content="Comment on this step">
              <Button
                size="xs"
                variant="ghost"
                colorPalette="blue"
                w="28px"
                h="28px"
                minW="28px"
                p={0}
                aria-label={`Comment on this step (${stepNumber})`}
                onClick={onOpenComment}
              >
                <LuMessageSquare />
              </Button>
            </Tooltip>
          )}
          {completed && flagged && (
            <Box
              display="grid"
              placeItems="center"
              w="28px"
              h="28px"
              borderRadius="md"
              bg={flagKind === 'blocked' ? 'orange.subtle' : 'red.subtle'}
              color={flagKind === 'blocked' ? 'orange.fg' : 'red.fg'}
            >
              <LuFlag aria-label={`${flagKind} step`} />
            </Box>
          )}
        </HStack>
      </Box>
      {commentOpen && (
        <HStack ml="42px" mt={2} gap={2}>
          <Input
            size="sm"
            aria-label={`Comment for step ${stepNumber}`}
            placeholder="Comment on this step (optional)"
            value={draft.comment}
            readOnly={completed}
            bg={completed ? 'bg.subtle' : undefined}
            onChange={(event) => onUpdate({ comment: event.target.value })}
          />
          {!completed && (
            <Button
              size="xs"
              variant="ghost"
              w="28px"
              minW="28px"
              p={0}
              aria-label={`Clear comment for step ${stepNumber}`}
              onClick={onClearComment}
            >
              <LuX />
            </Button>
          )}
        </HStack>
      )}
      {flagKind && flagged && (
        <HStack ml="42px" mt={2} gap={2}>
          <Input
            size="sm"
            aria-label={`${flagKind === 'failed' ? 'Failed' : 'Blocked'} note for step ${stepNumber}`}
            placeholder={flagKind === 'failed' ? 'What happened at this step?' : 'What blocked this step?'}
            value={flagKind === 'failed' ? draft.failedComment : draft.blockedComment}
            readOnly={completed}
            bg={completed ? 'bg.subtle' : undefined}
            onChange={(event) =>
              onUpdate(
                flagKind === 'failed' ? { failedComment: event.target.value } : { blockedComment: event.target.value },
              )
            }
          />
          {!completed && (
            <Button
              size="xs"
              variant="ghost"
              w="28px"
              minW="28px"
              p={0}
              aria-label={`Clear ${flagKind} note for step ${stepNumber}`}
              onClick={() => onUpdate(flagKind === 'failed' ? { failedComment: '' } : { blockedComment: '' })}
            >
              <LuX />
            </Button>
          )}
        </HStack>
      )}
    </Box>
  );
}
