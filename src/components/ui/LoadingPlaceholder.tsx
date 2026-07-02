// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, Image } from '@chakra-ui/react';

import { useColorMode } from '@/components/ui';

export function LoadingPlaceholder() {
  const { theme } = useColorMode();
  const isDark = theme === 'dark';

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" bg={isDark ? 'bg.page' : 'bg.page'}>
      <Box mb={8}>
        <Image src={isDark ? '/LogoLight.png' : '/LogoDark.png'} alt="Test Analysis Portal" maxW="300px" h="auto" />
      </Box>
    </Flex>
  );
}
