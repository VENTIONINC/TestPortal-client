// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Heading, VStack, Table, Spinner, Text } from '@chakra-ui/react';

import { useResultsAnalysisExportDialog } from '@/components/ui/components/Dialogs';
import { useGetApiV2StatusQuery } from '@/redux/apis/generatedApi';
export function InfoSettings() {
  const { data: status, isLoading } = useGetApiV2StatusQuery();
  const openAnalysisExportDialog = useResultsAnalysisExportDialog();

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.card" border="1px solid" borderColor="border.main" borderRadius="md" shadow="sm">
        <Box p={6} borderBottom="1px solid" borderColor="border.main">
          <Heading size="md" color="text.main">
            System Information
          </Heading>
        </Box>
        <Box p={6}>
          <Table.Root size="sm" variant="outline">
            <Table.Body>
              <Table.Row>
                <Table.Cell fontWeight="semibold" w="200px" color="text.main">
                  Client Version
                </Table.Cell>
                <Table.Cell color="text.secondary">{__APP_VERSION__}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell fontWeight="semibold" color="text.main">
                  Server Version
                </Table.Cell>
                <Table.Cell color="text.secondary">
                  {isLoading ? <Spinner size="xs" /> : status?.version || 'Unknown'}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      <Box bg="bg.card" border="1px solid" borderColor="border.main" borderRadius="md" shadow="sm">
        <Box p={6} borderBottom="1px solid" borderColor="border.main">
          <Heading size="md" color="text.main">Human Feedback Export</Heading>
        </Box>
        <Box p={6}>
          <Text color="text.secondary" fontSize="sm">
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
