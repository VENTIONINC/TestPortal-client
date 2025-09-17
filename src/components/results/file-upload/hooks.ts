import { useState } from 'react';
import { useFileUpload } from '@chakra-ui/react';

import { usePostApiV1JsonReportUploadMutation } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { toaster } from '@/components/ui';

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};

type UseResultsUploaderProps = {
  fileUpload: ReturnType<typeof useFileUpload>;
};

export const useResultsUploader = ({ fileUpload }: UseResultsUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const selectedProjectId = useSelectedProjectId();

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
            formData.append('projectId', selectedProjectId!);

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
    } catch {
      toaster.create({ title: 'Failed to upload files', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadProgress,
    handleUpload,
  };
};
