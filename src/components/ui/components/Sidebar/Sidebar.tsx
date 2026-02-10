import { Box, Flex, IconButton } from '@chakra-ui/react';
// import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiChevronLeft } from 'react-icons/fi';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

import { NavigationMenu } from '../NavigationMenu';
import { UserMenu } from '../UserMenu';
import { Logo, FullLogo, CloseNav } from './components';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { surfaces, borders, text } = useSurfaceColors();

  return (
    <Flex
      h="100%"
      // w={collapsed ? '64px' : '250px'}
      transition="width 0.2s"
      borderRight="1px solid"
      borderColor={borders.subtle}
      flexDir="column"
      bg={surfaces.sidebar}
      color={text.primary}
      shadow="sm"
      overflow="hidden"
      whiteSpace="nowrap"
    >
      {/* Logo */}
      <Flex
        align="center"
        h="66px"
        px="3"
        borderBottom="1px solid"
        borderColor={borders.subtle}
        // justify={collapsed ? 'center' : 'space-between'}
        gap={collapsed ? 2 : 0}
        // flexDir={collapsed ? 'column-reverse' : 'row'}
      >
        <IconButton
          size="sm"
          mx="6px"
          variant="ghost"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          transition="all 0.2s"
          transform={collapsed ? 'rotate(0deg)' : 'rotate(180deg)'}
        >
          <CloseNav />
        </IconButton>
        {collapsed ? <Logo /> : <FullLogo />}
      </Flex>

      {/* Navigation */}
      <Box flex="1" overflowY="auto" overflowX="hidden">
        <NavigationMenu collapsed={collapsed} />
      </Box>

      <Box position="fixed" width={collapsed ? 'auto' : '250px'} bottom={0} transition="left 0.2s">
        <UserMenu collapsed={collapsed} />
      </Box>
    </Flex>
  );
};
