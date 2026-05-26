import { Box, Spinner } from '@chakra-ui/react';

interface LoaderOverlayProps {
  isLoading?: boolean;
}

export const LoaderOverlay = ({ isLoading }: LoaderOverlayProps) => {
  if (!isLoading) return null;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.50"
      _dark={{ bg: 'blackAlpha.300' }}
      zIndex={10}
      display="flex"
      alignItems="center"
      justifyContent="center"
      backdropFilter="blur(1px)"
      borderRadius="xl"
    >
      <Spinner size="xl" color="blue.500" />
    </Box>
  );
};
