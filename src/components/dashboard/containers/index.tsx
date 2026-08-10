// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Flex } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { saveAs } from 'file-saver';

import { type PdfExportRequest, useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useExportDashboardPdfMutation } from '@/redux/apis/extendedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useFiltersWithUrl } from '@/hooks';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Alert, Filter, toaster } from '@/components/ui';
import { FilterProvider } from '@/contexts/FilterContext';
import { extractApiError } from '@/utils/apiErrors';

import { filterConfig } from '../configs';
import { DashboardExportSelect, type DashboardExportMode } from './DashboardExportSelect';
import { DashboardGrid } from './DashboardGrid';

const DEFAULT_PERIOD = '1';

const initialDashboardFilters: Record<string, string> = {
  execution: '',
  period: '',
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getExportGranularity = (periodDays: number): PdfExportRequest['granularity'] => {
  if (periodDays <= 31) {
    return 'daily';
  }

  if (periodDays <= 120) {
    return 'weekly';
  }

  return 'monthly';
};

const buildDashboardPdfExportRequest = ({
  projectId,
  period,
  includeAiInsights,
}: {
  projectId: string;
  period: string;
  includeAiInsights: boolean;
}): PdfExportRequest => {
  const parsedPeriod = Number.parseInt(period, 10);
  const periodDays =
    Number.isFinite(parsedPeriod) && parsedPeriod > 0 ? parsedPeriod : Number.parseInt(DEFAULT_PERIOD, 10);
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);

  periodStart.setDate(periodEnd.getDate() - Math.max(periodDays - 1, 0));

  return {
    project: projectId,
    executionType: 'all',
    periodStart: formatLocalDate(periodStart),
    periodEnd: formatLocalDate(periodEnd),
    granularity: getExportGranularity(periodDays),
    includeAiInsights,
  };
};

const buildDashboardPdfFileName = ({
  projectId,
  periodStart,
  periodEnd,
  includeAiInsights,
}: {
  projectId: string;
  periodStart: string;
  periodEnd: string;
  includeAiInsights: boolean;
}) => {
  const aiSuffix = includeAiInsights ? '-ai' : '';

  return `dashboard-${projectId}-${periodStart}-${periodEnd}${aiSuffix}.pdf`;
};

const DashboardContent = () => {
  const selectedProjectId = useSelectedProjectId();
  const [filters, setFilters] = useState(initialDashboardFilters);
  const [exportMode, setExportMode] = useState<DashboardExportMode | null>(null);
  const [exportDashboardPdf] = useExportDashboardPdfMutation();

  const { formMethods, filterProps } = useFiltersWithUrl({
    currentFilters: filters,
    initialFilters: initialDashboardFilters,
    onUpdateFilters: setFilters,
  });

  const effectiveFilters = filterProps.filters;
  const period = effectiveFilters.period || DEFAULT_PERIOD;

  // Fetch dashboard data for the last 30 days
  const { data, isLoading, error } = useGetApiV2ProjectsByProjectIdDashboardQuery({
    projectId: selectedProjectId,
    period,
  });

  const { summary, history } = data || {};

  const handleExportPdf = async (includeAiInsights: boolean) => {
    if (!selectedProjectId) {
      toaster.create({
        title: 'Export unavailable',
        description: 'Select a project before exporting the dashboard.',
        type: 'error',
      });

      return;
    }

    const nextExportMode: DashboardExportMode = includeAiInsights ? 'ai' : 'standard';
    setExportMode(nextExportMode);

    try {
      const pdfExportRequest = buildDashboardPdfExportRequest({
        projectId: selectedProjectId,
        period,
        includeAiInsights,
      });
      const pdfBlob = await exportDashboardPdf({ pdfExportRequest }).unwrap();

      saveAs(
        pdfBlob,
        buildDashboardPdfFileName({
          projectId: selectedProjectId,
          periodStart: pdfExportRequest.periodStart,
          periodEnd: pdfExportRequest.periodEnd,
          includeAiInsights,
        }),
      );

      toaster.create({
        title: 'Export ready',
        description: includeAiInsights
          ? 'Dashboard PDF with AI insights is downloading.'
          : 'Dashboard PDF download has started.',
        type: 'success',
      });
    } catch (exportError) {
      const message =
        exportError && typeof exportError === 'object'
          ? extractApiError(exportError as FetchBaseQueryError | SerializedError)
          : 'Failed to export dashboard PDF. Please try again.';

      toaster.create({
        title: 'Export failed',
        description: message,
        type: 'error',
      });
    } finally {
      setExportMode(null);
    }
  };

  const actionButton = (
    <DashboardExportSelect
      disabled={!selectedProjectId || exportMode !== null}
      exportMode={exportMode}
      onSelect={(mode) => void handleExportPdf(mode === 'ai')}
    />
  );

  if (error) {
    return (
      <MainTemplate pageHeader="Dashboard" actionButton={actionButton}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load dashboard data. Please try again later.</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate pageHeader="Dashboard" actionButton={actionButton}>
      <FormProvider {...formMethods}>
        <Flex align="stretch" gap={6}>
          <Filter config={filterConfig} {...filterProps} />
          <DashboardGrid summary={summary} history={history} isLoading={isLoading} period={period} />
        </Flex>
      </FormProvider>
    </MainTemplate>
  );
};

export const DashboardContainer = () => (
  <FilterProvider storageKey="dashboard">
    <DashboardContent />
  </FilterProvider>
);
