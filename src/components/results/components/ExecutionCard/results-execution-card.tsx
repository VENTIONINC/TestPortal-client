import { memo, useState } from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';

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

          return (
            <VStack
              key={id}
              align="stretch"
              py={2}
              ps={2}
              borderBottom="1px solid"
              borderColor="border.main"
              _last={{ borderBottom: 'none' }}
              position="relative"
            >
              {/* Row 1: Execution Metadata & Analysis Badge */}
              <HStack align="center" justify="space-between" w="full" minH="36px">
                <HStack align="center" gap={5}>
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
                    <Text whiteSpace="nowrap" minW={6} textStyle="sm">
                      #{retry}
                    </Text>
                  </Tooltip>
                  <IntegrationLinks
                    monitoringUrl={monitoringPortalUrl}
                    reportPortalUrl={reportPortalLink || reportPortalUrl}
                    monitoringPortalEnabled={monitoringPortalEnabled}
                    reportPortalEnabled={reportPortalEnabled}
                    duration={duration}
                    startTime={startTime}
                    environment={environment}
                  />
                  <Tooltip content="Start Time">
                    <Text textStyle="sm">{toStartTime(startTime)}</Text>
                  </Tooltip>
                  <Tooltip content="Duration">
                    <Text textStyle="sm">{toDuration(duration)}</Text>
                  </Tooltip>
                </HStack>

                <HStack align="center" gap={3}>
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
              </HStack>

              {/* Row 2: Error Messages & Inline Issues (if failed) */}
              {errors.length > 0 && (
                <VStack align="stretch" pl={12} pr={8} mt={2} gap={3}>
                  {errors.map((resultError) => (
                    <VStack
                      key={resultError.id}
                      align="stretch"
                      w="full"
                      px={4}
                      py={3}
                      bg="bg.panel"
                      border="1px solid"
                      borderColor="border.main"
                      borderRadius="md"
                      gap={2.5}
                    >
                      <VStack align="stretch" gap={1}>
                        <Text
                          fontSize="10px"
                          fontWeight="bold"
                          color="fg.muted"
                          letterSpacing="wider"
                          textTransform="uppercase"
                        >
                          Error Message
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          onClick={() => openResultsErrorDialog(resultError)}
                          cursor="pointer"
                          wordBreak="break-word"
                          lineHeight="tall"
                        >
                          {resultError.message}
                        </Text>
                      </VStack>
                      <HStack justify="flex-end" w="full" flexShrink={0}>
                        <InlineIssue resultError={resultError} />
                      </HStack>
                    </VStack>
                  ))}
                </VStack>
              )}
            </VStack>
          );
        })}
      </VStack>
    );
  },
);
