import { useCallback, useEffect, useMemo } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { Filter, LoaderOverlay } from '@/components/ui';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { getEffectiveDatesInRange } from '@/utils/dateUtils';

import { ResultsFloatingHeader, ResultsList, TopSectionContainer } from '../components';
import { filterConfig } from '../configs';
import { useResultsData, useResultsEffectiveFilters } from '../hooks';

export const ResultContainerInner = () => {
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();
  const { toggleDate, setSelectedDates } = useResultsActions();
  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const { effectiveFilters, debouncedFilters, filterFormMethods, filterProps } = useResultsEffectiveFilters();

  useEffect(() => {
    setSelectedDates([effectiveFilters.to]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFilters.to]);

  const { results, unfilteredResultsMap, activeDaysResultsIds, availableDates, rawResults, isFetching } =
    useResultsData({
      effectiveFilters,
      debouncedFilters,
      selectedDates,
      selectedProjectId: selectedProjectId!,
    });

  const handleSelectAll = useCallback(() => selectAll(activeDaysResultsIds), [selectAll, activeDaysResultsIds]);

  const selectedCount = getSelectedCount();
  const selectedResults = useMemo(
    () => rawResults.filter(({ id }) => getSelectedIds().includes(id)),
    [rawResults, getSelectedIds],
  );

  const activeDates = useMemo(
    () => getEffectiveDatesInRange(selectedDates, effectiveFilters.from, effectiveFilters.to),
    [selectedDates, effectiveFilters.from, effectiveFilters.to],
  );

  const [debouncedDates] = useDebounce(activeDates, 200);
  const { data: statisticsData, isFetching: isStatsFetching } = useGetApiV2ResultsStatsQuery(
    { dates: debouncedDates, projectId: selectedProjectId! },
    { skip: debouncedDates.length === 0 },
  );

  const statistics = debouncedDates.length === 0 ? undefined : statisticsData;

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    rawResults.forEach((result) => {
      if (result.spec?.tags) {
        result.spec.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [rawResults]);

  const dynamicFilterConfig = useMemo(() => {
    return filterConfig.map((section) => {
      if (section.title === 'Spec') {
        return {
          ...section,
          fields: section.fields.map((field) => {
            if (field.name === 'tags') {
              return {
                ...field,
                options: availableTags.map((tag) => ({ value: tag, label: tag })),
              };
            }
            return field;
          }),
        };
      }
      return section;
    });
  }, [availableTags]);

  const activeTags = useMemo(() => {
    return typeof effectiveFilters.tags === 'string' && effectiveFilters.tags
      ? (effectiveFilters.tags as string).split(',')
      : Array.isArray(effectiveFilters.tags)
        ? effectiveFilters.tags
        : [];
  }, [effectiveFilters.tags]);

  const handleToggleTag = useCallback(
    (tag: string) => {
      const newTags = activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag];
      filterProps.onApplyFilters({ ...(effectiveFilters as Record<string, string>), tags: newTags.join(',') });
    },
    [activeTags, effectiveFilters, filterProps],
  );

  return (
    <FormProvider {...filterFormMethods}>
      <HStack w="100%" display="grid" alignItems="start" gap={0} gridTemplateColumns="auto 1fr">
        <Filter config={dynamicFilterConfig} {...filterProps} />

        <VStack
          as="section"
          align="stretch"
          flex={1}
          minW={0}
          overflow="visible"
          position="relative"
          ml={6}
          mr={6}
          mt={4}
        >
          <LoaderOverlay isLoading={isFetching || isStatsFetching} />
          <ResultsFloatingHeader
            availableDates={availableDates}
            statistics={statistics}
            toggleDate={toggleDate}
            isFetching={isStatsFetching}
            availableTags={availableTags}
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
          />
          <Box position="relative">
            <TopSectionContainer statistics={statistics} isFetching={isStatsFetching} />

            <ResultsList
              activeDaysResultsIds={activeDaysResultsIds}
              handleSelectAll={handleSelectAll}
              selectedCount={selectedCount}
              selectedResults={selectedResults}
              isFetching={isFetching}
              results={results}
              unfilteredResultsMap={unfilteredResultsMap}
              activeTags={activeTags}
              onToggleTag={handleToggleTag}
            />
          </Box>
        </VStack>
      </HStack>
    </FormProvider>
  );
};

export const ResultContainer = () => {
  return (
    <ResultsSelectionProvider>
      <ResultContainerInner />
    </ResultsSelectionProvider>
  );
};
