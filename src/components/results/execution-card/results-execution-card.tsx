import { Fragment, memo } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme';
import { Checkbox, ClipboardCopyText, ContextMenuButton, Tooltip } from '@/components/ui';
import { InlineIssue } from '@/components/issues';
import { useResultAnalysisDialog, useResultsErrorDialog } from '@/components/ui/components/Dialogs';
import { useResultsSelection } from '@/contexts/results-selection';
import { getAnalysisCategoryStyle, getConfidenceLabel, getResultStatusStyle } from '@/utils';
import { toDuration, toStartTime } from '@/utils/date-time.converter';

import { BulkActions } from '../../BulkActions';
import { ResultsExecutionCardProps } from './types';
import { IntegrationLinks } from './integration-links';

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

    const toggleSelectAll = () => {
      toggleMultiple(results.map(({ id }) => id));
    };

    const selectedResults = results.filter(({ id }) => getSelectedIds().includes(id));

    return (
      <VStack
        align="stretch"
        p={2}
        bg={surfaces.card}
        border="1px solid"
        borderColor={borders.subtle}
        borderRadius="md"
      >
        <HStack gap={6} pl={2} bg={surfaces.panel} borderRadius="sm" textStyle="sm" minH={8}>
          <Checkbox
            checked={results.every(({ id }) => isSelected(id))}
            onCheckedChange={toggleSelectAll}
            size="sm"
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
            analysisStatus,
            analysisConfidence,
          } = result;

          return (
            <HStack key={id} align="center" ps={2} textStyle="sm" position="relative">
              <HStack align="center" gap={4} flex={1}>
                <Checkbox
                  checked={isSelected(id)}
                  onCheckedChange={() => {
                    toggleSelection(id);
                  }}
                  size="sm"
                  controlProps={{ borderColor: borders.subtle }}
                />
                <Flex w={2} h={4} borderRadius="xs" bg={getResultStatusStyle(status).color} />
                <Tooltip content="Retry">
                  <Text whiteSpace="nowrap" minW={6}>
                    # {retry}
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

                {errors.map((resultError) => {
                  const { Icon, color, hoverBgColor } = getAnalysisCategoryStyle(analysisCategory);
                  const hasAnalysis = Boolean(analysisStatus && analysisConfidence);

                  return (
                    <Fragment key={resultError.id}>
                      <Text onClick={() => openResultsErrorDialog(resultError)} cursor="pointer">
                        {resultError.message}
                      </Text>
                      {hasAnalysis && (
                        <HStack
                          color={color}
                          onClick={() => openResultAnalysisDialog(result)}
                          px={1}
                          borderRadius="sm"
                          cursor="pointer"
                          _hover={{ bg: hoverBgColor ?? states.hoverSubtle }}
                        >
                          <Icon size={16} color="currentColor" />
                          <Text>{getConfidenceLabel(analysisConfidence)}</Text>
                        </HStack>
                      )}
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
