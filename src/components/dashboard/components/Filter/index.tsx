import { Button, Heading, HStack, Spinner, Text, VStack, Box, useMediaQuery } from '@chakra-ui/react';

import { IssuesFilters } from '@/components/issues';

export const Filter = ({ showFilters = true }) => {
  return (
    <Box
      width={showFilters ? '360px' : '0px'}
      opacity={showFilters ? 1 : 0}
      overflow="hidden"
      transition="all 0.3s ease-in-out"
      flexShrink={0}
    >
      {/* <IssuesFilters as="aside" width="360px" /> */}
    </Box>
  );
};
