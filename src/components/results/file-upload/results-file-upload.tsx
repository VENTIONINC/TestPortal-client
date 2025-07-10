import { Button, HStack, Text, useFileUpload, VStack } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

import { FileUploadDropzone, FileUploadRoot, ProgressBar, ProgressRoot } from '@/components/ui';

import { useResultsUploader } from './hooks';

export const ResultsFileUpload = () => {
  const fileUpload = useFileUpload({ maxFiles: 1000, accept: ['application/json'] });
  const { isUploading, uploadProgress, handleUpload } = useResultsUploader({ fileUpload });

  return (
    <VStack align="stretch" border="1px solid" borderColor="gray.400" borderRadius="md" p={4}>
      <Text fontWeight={700}>Upload Results</Text>
      <FileUploadRoot value={fileUpload} cursor="pointer">
        <FileUploadDropzone label="Select JSON files" w="100%" minH="unset" p={4} flexDir="row" />
      </FileUploadRoot>

      {fileUpload.acceptedFiles.length > 0 && (
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm">
              Selected {fileUpload.acceptedFiles.length} file{fileUpload.acceptedFiles.length > 1 ? 's' : ''}
            </Text>
            <LuX size={20} onClick={fileUpload.clearFiles} style={{ cursor: 'pointer' }} />
          </HStack>

          {isUploading && (
            <ProgressRoot value={uploadProgress} min={0} max={100}>
              <ProgressBar />
            </ProgressRoot>
          )}

          <Button onClick={handleUpload} disabled={isUploading} colorScheme="blue">
            {isUploading
              ? 'Uploading...'
              : `Upload ${fileUpload.acceptedFiles.length} Report${fileUpload.acceptedFiles.length > 1 ? 's' : ''}`}
          </Button>
        </VStack>
      )}
    </VStack>
  );
};
