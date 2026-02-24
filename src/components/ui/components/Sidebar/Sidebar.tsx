import { Box, Flex, IconButton } from '@chakra-ui/react';
import { Link } from 'react-router';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

import { NavigationMenu } from '../NavigationMenu';
import { UserMenu } from '../UserMenu';
import { Logo, FullLogo, CloseNav } from './components';

interface SidebarProps {
  collapsed: boolean;
  handleSetCollapsed: () => void;
}

export const Sidebar = ({ collapsed, handleSetCollapsed }: SidebarProps) => {
  const { surfaces, borders, text } = useSurfaceColors();

  return (
    <Flex
      h="100%"
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
        gap={collapsed ? 2 : 0}
      >
        <IconButton
          size="sm"
          mx="6px"
          variant="ghost"
          aria-label="Toggle sidebar"
          onClick={handleSetCollapsed}
          transition="all 0.2s"
          cursor="pointer"
          transform={collapsed ? 'rotate(0deg)' : 'rotate(180deg)'}
        >
          <CloseNav />
        </IconButton>

        <Link to="/dashboard">{collapsed ? <Logo /> : <FullLogo />}</Link>
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
