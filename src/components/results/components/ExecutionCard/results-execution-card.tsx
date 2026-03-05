import { Fragment, memo, useState } from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme';
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
    const { surfaces, borders, states } = useSurfaceColors();

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
        <HStack gap={4} pl={2} bg={surfaces.panel} borderRadius="sm" textStyle="sm" minH="47px">
          <Checkbox
            checked={results.every(({ id }) => isSelected(id))}
            onCheckedChange={toggleSelectAll}
            size="md"
            controlProps={{ borderColor: borders.subtle }}
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
          } = result;

          const { Icon, color, hoverBgColor, hoverColor } = getAnalysisCategoryStyle(analysisCategory);
          const hasAnalysis = Boolean(analysisConfidence);

          return (
            <HStack key={id} align="center" ps={2} textStyle="sm" position="relative" minH="40px">
              <HStack align="center" gap={5} flex={1}>
                <Checkbox
                  checked={isSelected(id)}
                  onCheckedChange={() => {
                    toggleSelection(id);
                  }}
                  size="md"
                  controlProps={{ borderColor: borders.subtle }}
                />

                <StatusIcon status={status} type="circle" />

                <Tooltip content="Retry">
                  <Text whiteSpace="nowrap" minW={6}>
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
                  <Text>{toStartTime(startTime)}</Text>
                </Tooltip>
                <Tooltip content="Duration">
                  <Text>{toDuration(duration)}</Text>
                </Tooltip>
                {errors.length > 0 &&
                  (hasAnalysis ? (
                    <HStack
                      color={color}
                      onClick={() => openResultAnalysisDialog(result)}
                      px={1}
                      borderRadius="sm"
                      cursor="pointer"
                      _hover={{ bg: hoverBgColor ?? states.hoverSubtle, color: hoverColor ?? color }}
                    >
                      <Icon size={16} color="currentColor" />
                      <Text>{getConfidenceLabel(analysisConfidence)}</Text>
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
                {errors.map((resultError) => {
                  return (
                    <Fragment key={resultError.id}>
                      <Text fontSize="sm" onClick={() => openResultsErrorDialog(resultError)} cursor="pointer">
                        {resultError.message}
                      </Text>
                      <InlineIssue resultError={resultError} />
                    </Fragment>
                  );
                })}
              </HStack>

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
          );
        })}
      </VStack>
    );
  },
);
