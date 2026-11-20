// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { FiCheck, FiCheckCircle, FiFlag, FiInfo, FiRotateCcw } from 'react-icons/fi';
import { LuArrowRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Link } from 'react-router';

import type { ManualTestRunRead, ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';

import { RESULTS, resultLabels } from '../manualRunResults';
import { resultColors } from './resultColors';

interface ManualRunScenarioResultsProps {
  result: ManualTestRunScenarioResult;
  run: Pick<ManualTestRunRead, 'completedAt' | 'completedBy' | 'hasBeenReopened'>;
  runPath: string;
  completed: boolean;
  recoveryRequired: boolean;
  completing: boolean;
  allScenariosMarked: boolean;
  scenarioNumber: number;
  scenarioCount: number;
  previousId?: string;
  nextId?: string;
  nextUntestedId?: string;
  onChangeResult: (result: ManualTestRunScenarioResult) => void;
  onNavigate: (id: string) => void;
  onComplete: () => void;
}

export function ManualRunScenarioResults({
  result: currentResult,
  run,
  runPath,
  completed,
  recoveryRequired,
  completing,
  allScenariosMarked,
  scenarioNumber,
  scenarioCount,
  previousId,
  nextId,
  nextUntestedId,
  onChangeResult,
  onNavigate,
  onComplete,
}: ManualRunScenarioResultsProps) {
  return (
    <>
      <HStack wrap="wrap" gap={2}>
        {RESULTS.map((result) => (
          <Button
            key={result}
            size="sm"
            h="40px"
            variant={currentResult === result ? 'solid' : 'outline'}
            bg={currentResult === result ? undefined : 'bg.panel'}
            colorPalette={resultColors[result]}
            disabled={completed || recoveryRequired}
            _disabled={{ opacity: 1, cursor: 'not-allowed' }}
            aria-pressed={currentResult === result}
            onClick={() => onChangeResult(result)}
          >
            <Box
              as="span"
              w="7px"
              h="7px"
              borderRadius="full"
              bg={currentResult === result ? 'currentColor' : `${resultColors[result]}.500`}
            />
            {resultLabels[result]}
          </Button>
        ))}
      </HStack>
      <HStack justify="end" mt={3} wrap="wrap" gap={2}>
        <Text fontSize="sm" color="fg.muted">
          {scenarioNumber} of {scenarioCount}
        </Text>
        <Button
          size="sm"
          variant="outline"
          bg="bg.panel"
          w="40px"
          minW="40px"
          h="40px"
          p={0}
          aria-label="Previous scenario"
          disabled={!previousId}
          onClick={() => previousId && onNavigate(previousId)}
        >
          <LuChevronLeft />
        </Button>
        <Button
          size="sm"
          variant="outline"
          bg="bg.panel"
          w="40px"
          minW="40px"
          h="40px"
          p={0}
          aria-label="Next scenario"
          disabled={!nextId}
          onClick={() => nextId && onNavigate(nextId)}
        >
          <LuChevronRight />
        </Button>
        {completed ? (
          <HStack
            bg="green.subtle"
            color="green.fg"
            borderRadius="md"
            px={3}
            h="40px"
            fontSize="sm"
            fontWeight="semibold"
            gap={2}
          >
            <FiCheck aria-hidden="true" /> <Text>Completed</Text>
          </HStack>
        ) : allScenariosMarked ? (
          <Button
            size="sm"
            colorPalette="blue"
            h="40px"
            loading={completing}
            disabled={recoveryRequired}
            onClick={onComplete}
          >
            <FiFlag aria-hidden="true" /> Complete run
          </Button>
        ) : (
          <Button
            size="sm"
            colorPalette="blue"
            h="40px"
            disabled={!nextUntestedId}
            onClick={() => nextUntestedId && onNavigate(nextUntestedId)}
          >
            <LuArrowRight />
            Next untested
          </Button>
        )}
      </HStack>
      {completed && (
        <HStack
          role="status"
          mt={3}
          px={4}
          py={3}
          align="start"
          borderRadius="md"
          bg="green.subtle"
          color="green.fg"
          fontSize="sm"
        >
          <Box as={FiCheckCircle} boxSize="14px" flexShrink={0} mt="3px" aria-hidden="true" />
          <Text>
            Run completed{run.completedAt ? ` on ${new Date(run.completedAt).toLocaleDateString()}` : ''}
            {run.completedBy?.name ? ` by ${run.completedBy.name}` : ''}. The results are locked. Reopen the run to
            change them.{' '}
            <Link to={runPath} style={{ fontWeight: 600, textDecoration: 'underline' }}>
              Open run
            </Link>
          </Text>
        </HStack>
      )}
      {!completed && allScenariosMarked && (
        <HStack
          role="status"
          mt={3}
          borderRadius="md"
          bg="blue.subtle"
          color="blue.fg"
          minH="46px"
          px={4}
          py={2}
          align="center"
        >
          <Box as={run.hasBeenReopened ? FiRotateCcw : FiInfo} boxSize="14px" flexShrink={0} aria-hidden="true" />
          <Text fontSize="14px">
            {run.hasBeenReopened ? (
              <>
                <Text as="span" fontWeight="medium">
                  Run reopened.
                </Text>{' '}
                Results are editable again. Complete the run when you’re done.
              </>
            ) : (
              'All scenarios are marked. Complete the run to finish it: its results are then locked until you reopen it.'
            )}
          </Text>
        </HStack>
      )}
    </>
  );
}
