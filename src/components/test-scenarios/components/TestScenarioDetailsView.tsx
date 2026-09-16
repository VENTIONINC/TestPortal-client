// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';

import { ContextMenuButton, Link, Wrap } from '@/components/ui';
import type { TestScenario } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';

import type { TestScenarioContextMenuHandler } from '../hooks/useTestScenarioContextMenu';

export interface TestScenarioDetailsViewProps {
  scenario: TestScenario;
  onContextMenu: TestScenarioContextMenuHandler;
}

const structuredFields = [
  ['Details', 'details'],
  ['Objective', 'objective'],
  ['Preconditions', 'preconditions'],
  ['Test data', 'testData'],
  ['Expected result', 'expectedResult'],
  ['Notes', 'notes'],
] as const;

const orderedSteps = (scenario: TestScenario) => [...scenario.steps].sort((left, right) => left.position - right.position);

export const TestScenarioDetailsView = ({ scenario, onContextMenu }: TestScenarioDetailsViewProps) => (
  <VStack align="stretch" gap={6} mx={{ base: 4, md: 6 }} my={4}>
    <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
      <HStack align="center" gap={2}>
        <Link
          href={PATHS.TEST_SCENARIOS}
          aria-label="Return to Test Scenarios"
          title="Return to Test Scenarios"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          p={2}
          borderRadius="md"
          color="text.active"
          _hover={{ bg: 'bg.subtle' }}
        >
          <FiArrowLeft size={18} aria-hidden="true" />
        </Link>
        <Heading size="lg">{scenario.title}</Heading>
      </HStack>
      <ContextMenuButton
        aria-label={`Actions for ${scenario.title}`}
        onClick={(event) => onContextMenu(event, scenario)}
      />
    </HStack>

    <Wrap w="100%" p={{ base: 4, md: 6 }}>
      <VStack align="stretch" w="100%" gap={6}>
        <VStack align="stretch" gap={4}>
          <Heading size="md">Scenario fields</Heading>
          {structuredFields.map(([label, field]) => (
            <Box key={field}>
              <Text fontWeight="semibold">{label}</Text>
              <Text whiteSpace="pre-wrap" color="text.secondary">
                {scenario[field] ?? 'No value'}
              </Text>
            </Box>
          ))}
        </VStack>

        <VStack align="stretch" gap={3}>
          <Heading size="md">Scenario steps</Heading>
          {orderedSteps(scenario).length === 0 ? (
            <Text color="text.muted">No steps saved.</Text>
          ) : (
            orderedSteps(scenario).map((step, index) => (
              <Box key={step.id} p={4} borderWidth="1px" borderColor="border.subtle" borderRadius="md">
                <VStack align="stretch" gap={2}>
                  <Text fontWeight="semibold">Step {index + 1}</Text>
                  <Text whiteSpace="pre-wrap"><Text as="span" fontWeight="medium">Action: </Text>{step.action}</Text>
                  <Text whiteSpace="pre-wrap" color="text.secondary">
                    <Text as="span" fontWeight="medium" color="text.main">Expected result: </Text>
                    {step.expectedResult ?? 'No expected result'}
                  </Text>
                </VStack>
              </Box>
            ))
          )}
        </VStack>

      </VStack>
    </Wrap>
  </VStack>
);
