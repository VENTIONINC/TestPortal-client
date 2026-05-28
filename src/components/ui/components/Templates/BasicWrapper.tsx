// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@chakra-ui/react';

export const BasicWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      minH="100%"
      bg="bg.page"
      _before={{
        content: '""',
        display: 'block',
        h: '66px',
      }}
    >
      {children}
    </Box>
  );
};
