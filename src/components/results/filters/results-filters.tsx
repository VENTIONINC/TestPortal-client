import { ChangeEvent, useState } from 'react';
import { Button, HStack, StackProps, Text, useFileUpload, VStack } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

import {
  FileUploadDropzone,
  FileUploadRoot,
  Input,
  NativeSelect,
  ProgressBar,
  ProgressRoot,
  toaster,
} from '@/components/ui';
import { FiltersContainer, FiltersGroup } from '@/components/filters';
import { usePostApiV1JsonReportUploadMutation } from '@/redux/apis/generatedApi';
import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { ResultsFilters as ResultsFiltersType, ResultStatus } from '@/types';

export const ResultsFilters = (props: StackProps) => {
  const filters = useResultsFilters();
  const fileUpload = useFileUpload({ maxFiles: 1000, accept: ['application/json'] });
  const { setFilters } = useResultsActions();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadJsonResults] = usePostApiV1JsonReportUploadMutation();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ [e.target.name]: e.target.value, page: 1 });
  };

  const isClearable = (filters: Partial<ResultsFiltersType>) => {
    return Object.keys(filters).some(
      (key) => filters[key as keyof ResultsFiltersType] !== initialFilters[key as keyof ResultsFiltersType],
    );
  };

  const handleSetFilters = (filters: Partial<ResultsFiltersType>) => {
    setFilters({ ...filters, page: 1 });
  };

  const handleUpload = async () => {
    if (fileUpload.acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const files = fileUpload.acceptedFiles;
      const totalFiles = files.length;
      let processedCount = 0;

      // Process files in chunks of 5 to avoid overwhelming the server
      const fileChunks = chunkArray(files, 5);

      for (const chunk of fileChunks) {
        // Process chunk in parallel
        await Promise.all(
          chunk.map(async (file) => {
            // Create FormData with the file
            const formData = new FormData();
            formData.append('report', file);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await uploadJsonResults({ body: formData as any });

            processedCount++;
            setUploadProgress((processedCount / totalFiles) * 100);
          }),
        );

        // Small delay between chunks to be nice to the server
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

  return (
    <FiltersContainer {...props}>
      <FiltersGroup
        title="Result Filters"
        clearable={isClearable({
          status: filters.status,
          reviewStatus: filters.reviewStatus,
          errorMessage: filters.errorMessage,
          from: filters.from,
          to: filters.to,
        })}
        onClear={() =>
          handleSetFilters({
            status: initialFilters.status,
            reviewStatus: initialFilters.reviewStatus,
            errorMessage: initialFilters.errorMessage,
            from: initialFilters.from,
            to: initialFilters.to,
          })
        }
      >
        <NativeSelect
          label="Status:"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            ...Object.values(ResultStatus).map((status) => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1),
            })),
          ]}
        />
        <NativeSelect
          label="Review status:"
          name="reviewStatus"
          value={filters.reviewStatus}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            { value: 'completed', label: 'Completed' },
            { value: 'inCompleted', label: 'Not Completed' },
          ]}
        />
        <Input label="Error message" name="errorMessage" value={filters.errorMessage} onChange={handleFilterChange} />
        <Input label="From" name="from" value={filters.from} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="to" value={filters.to} onChange={handleFilterChange} type="date" />
      </FiltersGroup>

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ issueName: filters.issueName })}
        onClear={() => handleSetFilters({ issueName: initialFilters.issueName })}
      >
        <Input label="Issue name:" name="issueName" value={filters.issueName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Spec Filters"
        clearable={isClearable({
          tag: filters.tag,
          specId: filters.specId,
          specFile: filters.specFile,
          specName: filters.specName,
        })}
        onClear={() =>
          handleSetFilters({
            tag: initialFilters.tag,
            specId: initialFilters.specId,
            specFile: initialFilters.specFile,
            specName: initialFilters.specName,
          })
        }
      >
        <Input label="Tag:" name="tag" value={filters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
        <Input label="Spec file:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
        <Input label="Spec name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Execution Filters"
        clearable={isClearable({ environment: filters.environment, type: filters.type })}
        onClear={() => handleSetFilters({ environment: initialFilters.environment, type: initialFilters.type })}
      >
        <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
      </FiltersGroup>

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
    </FiltersContainer>
  );
};

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};
