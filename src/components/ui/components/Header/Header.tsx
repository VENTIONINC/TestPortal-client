// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Heading, Flex, IconButton, Button } from '@chakra-ui/react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';

import { useColorMode, useResultsFileUploadDialog } from '@/components/ui';

import { ProjectSelect } from './components';

interface HeaderProps {
  title: string;
  actionButton?: React.ReactNode;
}

export const Header = ({ title, actionButton }: HeaderProps) => {
  const { toggleColorMode, colorMode, theme } = useColorMode();
  const openUploadDialog = useResultsFileUploadDialog();

  return (
    <Box bg="bg.section"  borderBottom="1px solid" borderColor="border.main">
      <Container px={6} maxW="full" >
        <Flex justify="space-between" align="center" h="65px">
          <Heading size="xl" color="text.primary" >
            {title}
          </Heading>

          <Flex align="center" gap={4} ml="auto" mr="20px">
            {actionButton && actionButton}
            <ProjectSelect />

            <Button variant="outline" size="sm" onClick={openUploadDialog}>
              <LuUpload size={16} />
              Upload
            </Button>
          </Flex>
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
            {theme === 'system' ? <FiSun /> : theme === 'light' ? <FiMoon /> : <FiMonitor />}
          </IconButton>
        </Flex>
      </Container>
    </Box>
  );
};
