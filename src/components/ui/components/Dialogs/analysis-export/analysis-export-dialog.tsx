// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, Input, NativeSelect } from '@/components/ui';
import { DefaultDialogProps } from '@/types';
import type { Project } from '@/redux/apis/generatedApi';

import { useResultsAnalysisExport } from './hooks';

export const ResultsAnalysisExportDialog = ({ closeDialog }: DefaultDialogProps) => {
  const { form, handleSubmit, isExporting, projects } = useResultsAnalysisExport(closeDialog);

  const projectItems = projects
    .filter((project: Project) => project.isActive)
    .map((project: Project) => ({
      value: project.id,
      label: project.name,
    }));

  return (
    <Dialog title="Human Feedback Export" onClose={closeDialog} size="md">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <NativeSelect
          {...form.register('projectId')}
          label="Project"
          placeholder="Select project"
          items={projectItems}
          error={form.formState.errors.projectId?.message}
        />
        <Input
          {...form.register('dateFrom')}
          label="Date from"
          type="date"
          error={form.formState.errors.dateFrom?.message}
        />
        <Input {...form.register('dateTo')} label="Date to" type="date" error={form.formState.errors.dateTo?.message} />
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" onClick={closeDialog}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={isExporting} disabled={!form.formState.isValid || isExporting}>
          Export Feedback
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
