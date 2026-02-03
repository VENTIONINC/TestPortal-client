import { Box, Heading, VStack, Table, Spinner } from '@chakra-ui/react';

import { useGetApiV2StatusQuery } from '@/redux/apis/generatedApi';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

export function InfoSettings() {
  const { data: status, isLoading } = useGetApiV2StatusQuery();
  const { surfaces, borders, text } = useSurfaceColors();

  return (
    <VStack gap={6} align="stretch">
      <Box bg={surfaces.card} border="1px solid" borderColor={borders.subtle} borderRadius="md" shadow="sm">
        <Box p={6} borderBottom="1px solid" borderColor={borders.subtle}>
          <Heading size="md" color={text.primary}>
            System Information
          </Heading>
        </Box>
        <Box p={6}>
          <Table.Root size="sm" variant="outline">
            <Table.Body>
              <Table.Row>
                <Table.Cell fontWeight="semibold" w="200px" color={text.primary}>
                  Client Version
                </Table.Cell>
                <Table.Cell color={text.secondary}>{__APP_VERSION__}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell fontWeight="semibold" color={text.primary}>
                  Server Version
                </Table.Cell>
                <Table.Cell color={text.secondary}>
                  {isLoading ? <Spinner size="xs" /> : status?.version || 'Unknown'}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </VStack>
  );
}
