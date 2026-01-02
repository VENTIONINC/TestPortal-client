import { Box, Heading, VStack, Table, Spinner } from '@chakra-ui/react';

import { useGetApiV2StatusQuery } from '@/redux/apis/generatedApi';

export function InfoSettings() {
  const { data: status, isLoading } = useGetApiV2StatusQuery();

  return (
    <VStack gap={6} align="stretch">
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">System Information</Heading>
        </Box>
        <Box p={6}>
          <Table.Root size="sm" variant="outline">
            <Table.Body>
              <Table.Row>
                <Table.Cell fontWeight="semibold" w="200px">
                  Client Version
                </Table.Cell>
                <Table.Cell>{__APP_VERSION__}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell fontWeight="semibold">Server Version</Table.Cell>
                <Table.Cell>{isLoading ? <Spinner size="xs" /> : status?.version || 'Unknown'}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </VStack>
  );
}
