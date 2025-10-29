import { Fragment, memo } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { Checkbox, ClipboardCopyText } from '@/components/ui';
import { InlineIssue } from '@/components/issues';
import { useResultAnalysisDialog, useResultsErrorDialog } from '@/components/dialogs';
import { useResultsSelection } from '@/contexts/results-selection';
import { getAnalysisCategoryStyle, getConfidenceLabel, getResultStatusStyle } from '@/utils';
import { toDuration, toStartTime } from '@/utils/date-time.converter';

import { BulkActions } from '../../BulkActions';
import { ResultsExecutionCardProps } from './types';
import { IntegrationLinks } from './integration-links';

export const ResultsExecutionCard = memo(
  ({
    results,
    environment,
    type,
    name,
    provider,
    monitoringPortalUrl,
    reportPortalUrl,
    monitoringPortalEnabled,
    reportPortalEnabled,
  }: ResultsExecutionCardProps) => {
    const { isSelected, toggleSelection, toggleMultiple, getSelectedIds } = useResultsSelection();

    const openResultsErrorDialog = useResultsErrorDialog();
    const openResultAnalysisDialog = useResultAnalysisDialog();

    const toggleSelectAll = () => {
      toggleMultiple(results.map(({ id }) => id));
    };

    const selectedResults = results.filter(({ id }) => getSelectedIds().includes(id));

    return (
      <VStack align="stretch" p={2} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md">
        <HStack gap={6} px={2} bg="gray.200" borderRadius="sm" textStyle="sm" minH={8}>
          <Checkbox
            checked={results.every(({ id }) => isSelected(id))}
            onCheckedChange={toggleSelectAll}
            size="sm"
            controlProps={{ borderColor: 'black' }}
          />
          <ClipboardCopyText value={environment}>{environment}</ClipboardCopyText>
          <ClipboardCopyText value={type}>{type}</ClipboardCopyText>
          <Text>{name}</Text>
          <Text ms="auto" my={1}>
            {provider}
          </Text>

          <BulkActions selectedResults={selectedResults} />
        </HStack>

        {results.map((result) => (
          <HStack key={result.id} align="center" gap={4} ps={2} textStyle="sm">
            <Checkbox
              checked={isSelected(result.id)}
              onCheckedChange={() => {
                toggleSelection(result.id);
              }}
              size="sm"
              controlProps={{ borderColor: 'black' }}
            />
            <Flex w={2} h={4} borderRadius="xs" bg={getResultStatusStyle(result.status).color} />
            <Text whiteSpace="nowrap" minW={6}>
              # {result.retry}
            </Text>
            <IntegrationLinks
              monitoringUrl={monitoringPortalUrl}
              reportPortalUrl={result.reportPortalLink || reportPortalUrl}
              monitoringPortalEnabled={monitoringPortalEnabled}
              reportPortalEnabled={reportPortalEnabled}
              duration={result.duration}
              startTime={result.startTime}
              environment={environment}
            />

            <Text>{toStartTime(result.startTime)}</Text>
            <Text>{toDuration(result.duration)}</Text>

            {result.errors &&
              result.errors.map((resultError) => {
                const { Icon, color, hoverBgColor } = getAnalysisCategoryStyle(result.analysisCategory);
                const hasAnalysis = Boolean(result.analysisStatus && result.analysisConfidence);

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
                        _hover={{ bg: hoverBgColor }}
                      >
                        <Icon size={16} color="currentColor" />
                        <Text>{getConfidenceLabel(result.analysisConfidence)}</Text>
                      </HStack>
                    )}
                    <InlineIssue resultError={resultError} />
                  </Fragment>
                );
              })}
          </HStack>
        ))}
      </VStack>
    );
  },
);
