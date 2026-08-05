// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useState } from 'react';
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { Checkbox, ClipboardCopyText, ContextMenuButton, Tooltip, toaster, StatusIcon } from '@/components/ui';
import { InlineIssue } from '@/components/issues';
import { useResultAnalysisDialog, useResultsErrorDialog } from '@/components/ui/components/Dialogs';
import { useResultsSelection } from '@/contexts/results-selection';
import { getAnalysisCategoryStyle, getConfidenceLabel } from '@/utils';
import { toDuration, toStartTime } from '@/utils/date-time.converter';
import { usePostApiV2ResultErrorsAnalyzeMutation } from '@/redux/apis/generatedApi';
import { BulkActions } from '@/components/BulkActions';

import { ResultsExecutionCardProps } from './types';
import { IntegrationLinks } from './integration-links';
import { AnalyzeCategoryButton } from './analyze-category-button';

export const ResultsExecutionCard = memo(
  ({
    results,
    onContextMenu,
    onResultContextMenu,
    environment,
    type,
    name,
    provider,
    monitoringPortalUrl,
    reportPortalUrl,
    monitoringPortalEnabled,
    reportPortalEnabled,
    specName,
    projectId,
  }: ResultsExecutionCardProps) => {
    const { isSelected, toggleSelection, toggleMultiple, getSelectedIds } = useResultsSelection();

    const openResultsErrorDialog = useResultsErrorDialog();
    const openResultAnalysisDialog = useResultAnalysisDialog();
    const [analyzeErrors] = usePostApiV2ResultErrorsAnalyzeMutation();
    const [analyzingResultId, setAnalyzingResultId] = useState<string | null>(null);

    const toggleSelectAll = () => {
      toggleMultiple(results.map(({ id }) => id));
    };

    const selectedResults = results.filter(({ id }) => getSelectedIds().includes(id));

    const handleAnalyze = async (resultId: string, errorIds: string[]) => {
      setAnalyzingResultId(resultId);
      const id = toaster.create({
        title: 'Analyzing errors...',
        type: 'loading',
      });

      try {
        await analyzeErrors({
          analyzeResultErrorsRequest: {
            projectId,
            errorIds,
          },
        }).unwrap();

        toaster.update(id, {
          title: 'Categorization completed successfully',
          type: 'success',
        });
      } catch {
        toaster.update(id, {
          title: 'Failed to categorize errors',
          type: 'error',
        });
      } finally {
        setAnalyzingResultId(null);
      }
    };

    return (
      <VStack align="stretch" pt="16px" mt="7px" borderTop="1px solid" borderColor="border.main">
        <HStack gap={4} pl={2} bg="bg.panel" borderRadius="sm" textStyle="sm" minH="47px">
          <Checkbox
            checked={results.every(({ id }) => isSelected(id))}
            onCheckedChange={toggleSelectAll}
            size="md"
            controlProps={{ borderColor: 'border.main' }}
          />
          <Tooltip content="Environment">
            <ClipboardCopyText value={environment}>{environment}</ClipboardCopyText>
          </Tooltip>
          <Tooltip content="Type">
            <ClipboardCopyText value={type}>{type}</ClipboardCopyText>
          </Tooltip>
          <Text>{name}</Text>
          <Tooltip content="Provider">
            <Text ms="auto" my={1}>
              {provider}
            </Text>
          </Tooltip>

          <BulkActions selectedResults={selectedResults} />

          <ContextMenuButton onClick={onContextMenu} />
        </HStack>

        {results.map((result) => {
          const {
            id,
            retry,
            reportPortalLink,
            duration,
            startTime,
            status,
            errors = [],
            analysisCategory,
            analysisConfidence,
            analysisFeedbackCategory,
          } = result;

          const { Icon, color, hoverBgColor, hoverColor } = getAnalysisCategoryStyle(analysisCategory);
          const hasAnalysis = Boolean(analysisConfidence);
          const isConfirmedByUser = Boolean(analysisFeedbackCategory);

          const hasLinks = Boolean(
            (monitoringPortalUrl && monitoringPortalEnabled) ||
            ((reportPortalLink || reportPortalUrl) && reportPortalEnabled),
          );

          return (
            <Flex
              key={id}
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              justify="space-between"
              w="full"
              minH="36px"
              py={2}
              ps={2}
              pe={{ base: 2, md: 0 }}
              borderBottom="1px solid"
              borderColor="border.main"
              _last={{ borderBottom: 'none' }}
              position="relative"
              textStyle="sm"
              gap={{ base: 2, md: 4 }}
            >
              {/* Left side: Metadata & Error Message */}
              <Flex
                align={{ base: 'start', md: 'center' }}
                gap={{ base: 2, md: 5 }}
                flex={1}
                minW={0}
                flexWrap="wrap"
                direction="row"
              >
                <Checkbox
                  checked={isSelected(id)}
                  onCheckedChange={() => {
                    toggleSelection(id);
                  }}
                  size="md"
                  controlProps={{ borderColor: 'border.main' }}
                />

                <StatusIcon status={status} type="circle" />

                <Tooltip content="Retry">
                  <Box w={{ base: 'auto', md: '45px' }} flexShrink={0}>
                    <Text whiteSpace="nowrap" textStyle="sm">
                      #{retry}
                    </Text>
                  </Box>
                </Tooltip>

                {hasLinks && (
                  <HStack w={{ base: 'auto', md: '130px' }} gap={2.5} flexShrink={0}>
                    <IntegrationLinks
                      monitoringUrl={monitoringPortalUrl}
                      reportPortalUrl={reportPortalLink || reportPortalUrl}
                      monitoringPortalEnabled={monitoringPortalEnabled}
                      reportPortalEnabled={reportPortalEnabled}
                      duration={duration}
                      startTime={startTime}
                      environment={environment}
                    />
                  </HStack>
                )}

                <Tooltip content="Start Time">
                  <Box w={{ base: 'auto', md: '90px' }} flexShrink={0}>
                    <Text textStyle="sm" whiteSpace="nowrap">
                      {toStartTime(startTime)}
                    </Text>
                  </Box>
                </Tooltip>

                <Tooltip content="Duration">
                  <Box w={{ base: 'auto', md: '70px' }} flexShrink={0}>
                    <Text textStyle="sm" whiteSpace="nowrap">
                      {toDuration(duration)}
                    </Text>
                  </Box>
                </Tooltip>

                {/* Inline Error Message - Truncated if it doesn't fit */}
                {errors.map((resultError) => (
                  <Text
                    key={resultError.id}
                    onClick={() => openResultsErrorDialog(resultError)}
                    cursor="pointer"
                    fontWeight="medium"
                    color="fg"
                    truncate
                    flex={{ base: 'none', md: 1 }}
                    w={{ base: 'full', md: 'auto' }}
                    minW={{ base: '20px', md: 0 }}
                    mt={{ base: 1, md: 0 }}
                    pl={{ base: 10, md: 0 }}
                  >
                    {resultError.message}
                  </Text>
                ))}
              </Flex>

              {/* Right side: AI Badge, Inline Issue, Context Menu */}
              <HStack
                align="center"
                gap={3}
                flexShrink={0}
                justifyContent={{ base: 'flex-end', md: 'flex-start' }}
                pl={{ base: 10, md: 0 }}
              >
                {errors.length > 0 &&
                  (hasAnalysis ? (
                    <HStack
                      color={isConfirmedByUser ? 'white' : color}
                      onClick={() => openResultAnalysisDialog(result)}
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      cursor="pointer"
                      border={isConfirmedByUser ? '1px solid' : '1px dashed'}
                      borderColor={isConfirmedByUser ? color : 'border.muted'}
                      bg={isConfirmedByUser ? color : 'transparent'}
                      _hover={
                        isConfirmedByUser
                          ? { opacity: 0.85 }
                          : { bg: hoverBgColor ?? 'bg.hover', color: hoverColor ?? color }
                      }
                      flexShrink={0}
                    >
                      <Icon size={16} color="currentColor" style={{ flexShrink: 0 }} />
                      <Text fontWeight="bold" fontSize="xs" whiteSpace="nowrap">
                        {isConfirmedByUser ? 'Confirmed' : 'AI Suggested'}: {getConfidenceLabel(analysisConfidence)}
                      </Text>
                    </HStack>
                  ) : (
                    <AnalyzeCategoryButton
                      onClick={() =>
                        handleAnalyze(
                          String(id),
                          errors.map((e) => String(e.id)),
                        )
                      }
                      isLoading={analyzingResultId === String(id)}
                    />
                  ))}

                {errors.map((resultError) => (
                  <InlineIssue key={resultError.id} resultError={resultError} category={analysisCategory} />
                ))}

                <ContextMenuButton
                  onClick={(evt) =>
                    onResultContextMenu(evt, {
                      id,
                      retry,
                      specName,
                      projectId,
                    })
                  }
                />
              </HStack>
            </Flex>
          );
        })}
      </VStack>
    );
  },
);
