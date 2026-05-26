// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { zodResolver } from '@hookform/resolvers/zod';

import { toaster } from '@/components/ui';
import { useGetApiV2ProjectsQuery, type Project } from '@/redux/apis/generatedApi';
import { useLazyGetAnalysisExportQuery } from '@/redux/apis/extendedApi';
import { analysisExportSchema, AnalysisExportFormData } from '@/schemas';
import { useDialogActions } from '@/redux/slices/dialog';
import { extractApiError } from '@/utils/apiErrors';

import { ResultsAnalysisExportDialog } from './analysis-export-dialog';

export const useResultsAnalysisExport = (closeDialog: () => void) => {
  const { data: projects } = useGetApiV2ProjectsQuery({});
  const projectsList: Project[] = projects ?? [];
  const firstActiveProject = projectsList.find((project) => project.isActive);
  const [triggerExport, { isFetching }] = useLazyGetAnalysisExportQuery();

  const form = useForm<AnalysisExportFormData>({
    resolver: zodResolver(analysisExportSchema),
    mode: 'onChange',
    defaultValues: {
      projectId: firstActiveProject?.id || '',
      dateFrom: '',
      dateTo: '',
    },
  });

  useEffect(() => {
    if (firstActiveProject && !form.getValues('projectId')) {
      form.setValue('projectId', firstActiveProject.id, { shouldValidate: true });
    }
  }, [firstActiveProject, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const exportData = await triggerExport({
        projectId: data.projectId,
        dateFrom: new Date(`${data.dateFrom}T00:00:00.000Z`).toISOString(),
        dateTo: new Date(`${data.dateTo}T23:59:59.999Z`).toISOString(),
      }).unwrap();

      const fileName = `human-feedback-export-${data.projectId}-${data.dateFrom}-${data.dateTo}.jsonl`;
      const blob = new Blob([exportData], { type: 'application/jsonl' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toaster.create({
        title: 'Export ready',
        description: 'Your human feedback export download has started.',
        type: 'success',
      });

      closeDialog();
    } catch (error) {
      const message =
        error && typeof error === 'object'
          ? extractApiError(error as FetchBaseQueryError | SerializedError)
          : 'Failed to export human feedback. Please try again.';

      toaster.create({
        title: 'Export failed',
        description: message,
        type: 'error',
      });
    }
  });

  return {
    form,
    handleSubmit,
    isExporting: isFetching || form.formState.isSubmitting,
    projects: projectsList,
  };
};

export const useResultsAnalysisExportDialog = () => {
  const { openDialog } = useDialogActions();

  return () => openDialog(ResultsAnalysisExportDialog);
};
