import { useState } from 'react';
import { useFileUpload } from '@chakra-ui/react';

import { toaster } from '@/components/ui';
import { usePostApiV1JsonReportUploadMutation } from '@/redux/apis/generatedApi';
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

export const useResultsFileUpload = (closeDialog: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const selectedProjectId = useSelectedProjectId();

  const fileUpload = useFileUpload({ maxFiles: 1000, accept: ['application/json'] });
  const [uploadJsonResults] = usePostApiV1JsonReportUploadMutation();

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
            const formData = new FormData();

            formData.append('report', file);
            formData.append('projectId', selectedProjectId);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await uploadJsonResults({ body: formData as any });

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
