// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert as ChakraAlert, AlertRootProps, Box } from '@chakra-ui/react';
import { forwardRef } from 'react';

const Root = forwardRef<HTMLDivElement, AlertRootProps>(function AlertRoot(props, ref) {
  const status = props.status || 'info';

  return (
    <Box borderRadius="12px" p="15px" bg="bg.section">
      <ChakraAlert.Root ref={ref} {...props} bg={`status.${status}`} color="text.main">
        {props.children}
      </ChakraAlert.Root>
    </Box>
  );
});

export const Alert = {
  Root,
  Indicator: ChakraAlert.Indicator,
  Content: ChakraAlert.Content,
  Title: ChakraAlert.Title,
  Description: ChakraAlert.Description,
};
