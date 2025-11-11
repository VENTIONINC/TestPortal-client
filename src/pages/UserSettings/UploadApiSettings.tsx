import { Box, Text, VStack, Flex, Button, HStack, Input } from '@chakra-ui/react';
import { LuCopy, LuTrash } from 'react-icons/lu';

import { useGetApiV2UploadKeysQuery, useDeleteApiV2UploadKeysByIdMutation } from '@/redux/apis/generatedApi';
import { useGenerateApiKeyDialog, useConfirmApiKeyDeletionDialog } from '@/components/dialogs';
import { toaster, InputGroup } from '@/components/ui';
import { copyToClipboard } from '@/utils';

export function UploadApiSettings() {
  const { data, isLoading, error } = useGetApiV2UploadKeysQuery();
  const [deleteApiKey] = useDeleteApiV2UploadKeysByIdMutation();
  const openGenerateApiKeyDialog = useGenerateApiKeyDialog();

  const handleCopyApiKey = async (apiKey: string, projectName: string) => {
    try {
      await copyToClipboard(apiKey);
      toaster.create({
        title: 'API Key Copied',
        description: `API key for ${projectName} copied to clipboard`,
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard',
        type: 'error',
      });
    }
  };

  const openConfirmDeletionDialog = useConfirmApiKeyDeletionDialog({
    onConfirm: async (keyId: string, projectName: string) => {
      try {
        const result = await deleteApiKey({ id: keyId }).unwrap();
        toaster.create({
          title: 'API Key Deleted',
          description: result.message || `API key for ${projectName} has been revoked`,
          type: 'success',
        });
      } catch (error) {
        const errorMessage =
          error && typeof error === 'object' && 'data' in error
            ? (error.data as { error?: string })?.error || 'Failed to delete API key'
            : 'Failed to delete API key';

        toaster.create({
          title: 'Delete Failed',
          description: errorMessage,
          type: 'error',
        });
      }
    },
  });

  if (isLoading) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
        <Text color="gray.600">Loading API keys...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.700">Failed to load API keys</Text>
      </Box>
    );
  }

  const apiKeys = data?.data || [];

  if (apiKeys.length === 0) {
    return (
      <Box textAlign="center" py={8} bg="white" border="1px" borderColor="gray.200" borderRadius="md">
        <Text color="gray.500">No API keys found</Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Generate an API key to get started
        </Text>
        <Button mt={4} onClick={openGenerateApiKeyDialog}>
          Generate API Key
        </Button>
      </Box>
    );
  }

  return (
    <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
      <Box p={6} borderBottom="1px" borderColor="gray.200">
        <Flex justifyContent="space-between" alignItems="center">
          <VStack align="start" gap={2}>
            <Text fontSize="lg" fontWeight="semibold">
              Upload API Keys
            </Text>
            <Text color="gray.600" fontSize="sm">
              Manage your API keys for uploading test results
            </Text>
          </VStack>
          <Button onClick={openGenerateApiKeyDialog}>Generate API Key</Button>
        </Flex>
      </Box>

      <Box p={6}>
        <VStack align="stretch" gap={4}>
          {apiKeys.map((key) => (
            <Box key={key.id} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="md">
                    {key.projectName}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.600">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => openConfirmDeletionDialog(key.id, key.projectName)}
                    >
                      <LuTrash />
                    </Button>
                  </HStack>
                </HStack>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    API Key:
                  </Text>
                  <InputGroup
                    endElement={
                      <Button size="sm" onClick={() => handleCopyApiKey(key.apiKey, key.projectName)} variant="ghost">
                        <LuCopy />
                      </Button>
                    }
                  >
                    <Input value={key.apiKey} readOnly fontFamily="mono" fontSize="sm" bg="white" />
                  </InputGroup>
                </Box>
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
