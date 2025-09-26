import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuX } from 'react-icons/lu';

import {
  Dialog,
  DialogBody,
  DialogFooter,
  FileUploadDropzone,
  FileUploadRoot,
  NativeSelect,
  ProgressBar,
  ProgressRoot,
} from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useResultsFileUpload } from './hooks';

export const ResultsFileUploadDialog = ({ closeDialog }: DefaultDialogProps) => {
  const [uploadMethod, setUploadMethod] = useState('playwright');
  const { fileUpload, isUploading, uploadProgress, handleUpload } = useResultsFileUpload(closeDialog);

  return (
    <Dialog title="Upload Results" onClose={closeDialog} size="lg">
      <DialogBody>
        <VStack align="stretch" gap={4}>
          <NativeSelect value={uploadMethod} onChange={(e) => setUploadMethod(e.target.value)}>
            <option value="playwright">Playwright</option>
            <option value="ctrf">Common Test Report Format (CTRF)</option>
          </NativeSelect>

          <FileUploadRoot value={fileUpload} cursor="pointer">
            <FileUploadDropzone label="Drag and drop JSON files or click to select" w="100%" minH="120px" p={6} />
          </FileUploadRoot>

          {uploadMethod === 'playwright' && fileUpload.acceptedFiles.length > 0 && (
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
            </VStack>
          )}
        </VStack>
      </DialogBody>

      <DialogFooter>
        <Button
          onClick={handleUpload}
          loading={isUploading}
          disabled={isUploading || fileUpload.acceptedFiles.length === 0}
        >
          {isUploading
            ? 'Uploading...'
            : `Upload ${fileUpload.acceptedFiles.length} Report${fileUpload.acceptedFiles.length > 1 ? 's' : ''}`}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
