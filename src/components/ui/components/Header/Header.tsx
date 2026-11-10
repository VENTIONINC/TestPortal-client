// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Box, Container, Heading, Flex, IconButton, Button, Text } from '@chakra-ui/react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';

import { useColorMode, useResultsFileUploadDialog } from '@/components/ui';

import { ProjectSelect } from './components';

interface HeaderProps {
  title: string;
  actionButton?: React.ReactNode;
  compactOnNarrow?: boolean;
}

export const Header = ({ title, actionButton, compactOnNarrow = false }: HeaderProps) => {
  const [mounted, setMounted] = useState(false);
  const { toggleColorMode, colorMode, theme } = useColorMode();
  const openUploadDialog = useResultsFileUploadDialog();

  useEffect(() => setMounted(true), []);

  return (
    <Box bg="bg.section" borderBottom="1px solid" borderColor="border.main">
      <Container px={compactOnNarrow ? { base: 2, md: 6 } : 6} maxW="full">
        <Flex justify="space-between" align="center" h="65px">
          <Heading size="xl" color="text.primary" fontSize={compactOnNarrow ? { base: 'sm', md: 'xl' } : undefined} whiteSpace="nowrap">
            {title}
          </Heading>

          <Flex align="center" gap={compactOnNarrow ? { base: 1, md: 4 } : 4} ml="auto" mr={compactOnNarrow ? { base: 1, md: '20px' } : '20px'} minW={0}>
            {actionButton && actionButton}
            <Box maxW={compactOnNarrow ? { base: '100px', md: 'none' } : undefined} minW={0}><ProjectSelect /></Box>

            <Button variant="outline" size="sm" aria-label="Upload" onClick={openUploadDialog} px={compactOnNarrow ? { base: 2, md: 3 } : undefined}>
              <LuUpload size={16} />
              <Text display={compactOnNarrow ? { base: 'none', md: 'inline' } : 'inline'}>Upload</Text>
            </Button>
          </Flex>
          {mounted && (
            <IconButton
              aria-label="Toggle theme"
              onClick={toggleColorMode}
              variant="ghost"
              color={colorMode === 'light' ? 'black' : 'white'}
              borderWidth="1px"
              borderStyle="solid"
              size="sm"
              borderColor="border.subtle"
            >
              {theme === 'system' ? <FiMonitor /> : colorMode === 'light' ? <FiSun /> : <FiMoon />}
            </IconButton>
          )}
        </Flex>
      </Container>
    </Box>
  );
};
