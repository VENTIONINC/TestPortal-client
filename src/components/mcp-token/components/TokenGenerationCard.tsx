import { Box, Text } from '@chakra-ui/react';

export const TokenGenerationCard = () => {
  return (
    <Box p={4} bg="status.info.bg" border="1px" borderColor="status.info.text" borderRadius="md">
      <Text fontWeight="bold" color="status.info.text">
        MCP Token Generation
      </Text>
      <Text fontSize="sm" color="status.info.text" mt={1}>
        Click the button above to generate your MCP token for use with Claude desktop application.
      </Text>
    </Box>
  );
}
