// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo } from 'react';

import { useGetApiV2ProjectsByIdExecutionTypesQuery } from '@/redux/apis/generatedApi';
import { FilterFieldOption } from '@/types/filter';

interface UseExecutionTypeOptionsParams {
  projectId: string;
  selectedType: string;
  onInvalidType?: (type: 'all') => void;
}

interface UseExecutionTypeOptionsResult {
  options: FilterFieldOption[];
  isLoading: boolean;
  effectiveType: string;
}

export const normalizeExecutionTypeFilters = (
  filters: Record<string, string>,
): Record<string, string> => ({
  ...filters,
  type: filters.type || 'all',
});

export const useExecutionTypeOptions = ({
  projectId,
  selectedType,
  onInvalidType,
}: UseExecutionTypeOptionsParams): UseExecutionTypeOptionsResult => {
  const { data, isFetching, isError } = useGetApiV2ProjectsByIdExecutionTypesQuery(
    { id: projectId },
    { skip: !projectId },
  );

  const isTypePending =
    !!projectId && selectedType !== 'all' && !isError && (isFetching || data === undefined);

  const effectiveType = useMemo(() => {
    if (!selectedType || selectedType === 'all') {
      return 'all';
    }
    if (!projectId || isError) {
      return 'all';
    }
    if (isTypePending) {
      return 'all';
    }
    if (!data!.includes(selectedType)) {
      return 'all';
    }
    return selectedType;
  }, [selectedType, projectId, isError, isTypePending, data]);

  const options = useMemo(
    () => [
      { label: 'All', value: 'all' },
      ...(data ?? []).map((type) => ({ label: type, value: type })),
    ],
    [data],
  );

  useEffect(() => {
    if (isError && selectedType !== 'all') {
      onInvalidType?.('all');
    }
  }, [isError, onInvalidType, selectedType]);

  useEffect(() => {
    if (
      data !== undefined &&
      selectedType &&
      selectedType !== 'all' &&
      !data.includes(selectedType)
    ) {
      onInvalidType?.('all');
    }
  }, [data, onInvalidType, selectedType]);

  return { options, isLoading: isFetching, effectiveType };
};
