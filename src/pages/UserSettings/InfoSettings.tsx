import { Box, Button, Heading, VStack, Table, Spinner, Text } from '@chakra-ui/react';

import { useResultsAnalysisExportDialog } from '@/components/dialogs';
import { useGetApiV2StatusQuery } from '@/redux/apis/generatedApi';

export function InfoSettings() {
  const { data: status, isLoading } = useGetApiV2StatusQuery();
  const openAnalysisExportDialog = useResultsAnalysisExportDialog();

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

      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Human Feedback Export</Heading>
        </Box>
        <Box p={6}>
          <Text color="gray.600" fontSize="sm">
            Export human feedback data for a project and date range as a JSONL file.
          </Text>
          <Button mt={4} onClick={openAnalysisExportDialog}>
            Export Feedback
          </Button>
        </Box>
      </Box>
    </VStack>
  );
}
