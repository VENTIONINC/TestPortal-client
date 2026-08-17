// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { useFileUpload } from '@chakra-ui/react';

import { toaster } from '@/components/ui';
import {
  type FutureExecutionTimestampsWarning,
  usePostApiV2UploadJsonReportMutation,
} from '@/redux/apis/generatedApi';
import { usePostApiV2UploadCtrfReportMutation } from '@/redux/apis/extendedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useDialogActions } from '@/redux/slices/dialog';

import { ResultsFileUploadDialog } from './results-file-upload-dialog';

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};

export const useResultsFileUpload = (closeDialog: () => void, reportType: 'playwright' | 'ctrf' = 'playwright') => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const selectedProjectId = useSelectedProjectId();

  const fileUpload = useFileUpload({ maxFiles: 1000, accept: ['application/json'] });
  const [uploadJsonReport] = usePostApiV2UploadJsonReportMutation();
  const [uploadCtrfReport] = usePostApiV2UploadCtrfReportMutation();

  const handleUpload = async () => {
    if (fileUpload.acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const files = fileUpload.acceptedFiles;
      const totalFiles = files.length;
      let processedCount = 0;
      const warnings: FutureExecutionTimestampsWarning[] = [];

      const fileChunks = chunkArray(files, 5);

      for (const chunk of fileChunks) {
        const responses = await Promise.all(
          chunk.map(async (file) => {
            if (reportType === 'playwright') {
              const formData = new FormData();
              formData.append('report', file);
              formData.append('projectId', selectedProjectId);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return uploadJsonReport({ body: formData as any }).unwrap();
            }

            const formData = new FormData();
            formData.append('report', file);
            formData.append('projectId', selectedProjectId);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return uploadCtrfReport({ body: formData as any }).unwrap();
          }),
        );

        for (const response of responses) {
          warnings.push(...response.warnings);
          processedCount++;
          setUploadProgress((processedCount / totalFiles) * 100);
        }

        if (fileChunks.indexOf(chunk) < fileChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      fileUpload.clearFiles();
      setUploadProgress(0);
      const futureTimestampWarnings = warnings.filter(
        (warning) => warning.code === 'FUTURE_EXECUTION_TIMESTAMPS',
      );

      if (futureTimestampWarnings.length > 0) {
        const count = futureTimestampWarnings.reduce((total, warning) => total + warning.count, 0);
        const maxDeviationMinutes = Math.max(
          ...futureTimestampWarnings.map((warning) => warning.maxDeviationMinutes),
        );
        const thresholdMinutes = futureTimestampWarnings[0]?.thresholdMinutes ?? 10;

        toaster.create({
          title: 'Files uploaded with date warnings',
          description: `Detected ${count} execution timestamps more than ${thresholdMinutes} minutes in the future. Largest deviation: ${maxDeviationMinutes} minutes. Imported data was not changed.`,
          type: 'warning',
        });
      } else {
        toaster.create({ title: 'Files uploaded', type: 'success' });
      }
      closeDialog();
    } catch {
      toaster.create({ title: 'Failed to upload files', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    fileUpload,
    isUploading,
    uploadProgress,
    handleUpload,
  };
};

export const useResultsFileUploadDialog = () => {
  const { openDialog } = useDialogActions();

  return () => openDialog(ResultsFileUploadDialog, {});
};
