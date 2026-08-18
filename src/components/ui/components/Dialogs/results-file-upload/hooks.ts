// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { useFileUpload } from '@chakra-ui/react';

import { toaster } from '@/components/ui';
import { usePostApiV2UploadJsonReportMutation } from '@/redux/apis/generatedApi';
import { usePostApiV2UploadCtrfReportMutation } from '@/redux/apis/extendedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useDialogActions } from '@/redux/slices/dialog';
import { extractApiError } from '@/utils/apiErrors';

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

      const fileChunks = chunkArray(files, 5);

      for (const chunk of fileChunks) {
        await Promise.all(
          chunk.map(async (file) => {
            if (reportType === 'playwright') {
              const formData = new FormData();
              formData.append('report', file);
              formData.append('projectId', selectedProjectId);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await uploadJsonReport({ body: formData as any }).unwrap();
            } else {
              const formData = new FormData();
              formData.append('report', file);
              formData.append('projectId', selectedProjectId);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await uploadCtrfReport({ body: formData as any }).unwrap();
            }

            processedCount++;
            setUploadProgress((processedCount / totalFiles) * 100);
          }),
        );

        if (fileChunks.indexOf(chunk) < fileChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      fileUpload.clearFiles();
      setUploadProgress(0);
      toaster.create({ title: 'Files uploaded', type: 'success' });
      closeDialog();
    } catch (error) {
      toaster.create({
        title: 'Failed to upload file',
        description: extractApiError(error as Parameters<typeof extractApiError>[0]),
        type: 'error',
      });
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
