// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Heading, HStack, VStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';

import { ContextMenuButton, Link, MarkdownPreview, Wrap } from '@/components/ui';
import type { TestScenario } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';

import type { TestScenarioContextMenuHandler } from '../hooks/useTestScenarioContextMenu';

export interface TestScenarioDetailsViewProps {
  scenario: TestScenario;
  onContextMenu: TestScenarioContextMenuHandler;
}

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
      <VStack align="stretch" gap={4} w="100%">
        <Heading size="md">Markdown Preview</Heading>
        <MarkdownPreview content={scenario.contentMd} />
      </VStack>
    </Wrap>
  </VStack>
);
