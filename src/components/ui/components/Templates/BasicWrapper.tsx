import { Box } from '@chakra-ui/react';

export const BasicWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box minH="100vh" bg="bg.page">
      {children}
    </Box>
  );
};
