import { Box, Flex, IconButton } from '@chakra-ui/react';
import { Link } from 'react-router';


import { NavigationMenu } from '../NavigationMenu';
import { UserMenu } from '../UserMenu';
import { Logo, FullLogo, CloseNav } from './components';

interface SidebarProps {
  collapsed: boolean;
  handleSetCollapsed: () => void;
}

export const Sidebar = ({ collapsed, handleSetCollapsed }: SidebarProps) => {

  return (
    <Flex
      h="100vh"
      w={collapsed ? '64px' : '250px'}
      position="fixed"
      left="0"
      top="0"
      zIndex="100"
      transition="width 0.2s"
      borderRight="1px solid"
      borderColor="border.main"
      flexDir="column"
      bg="bg.section"
      color="text.primary"
      shadow="sm"
      overflow="hidden"
      whiteSpace="nowrap"
    >
      {/* Logo */}
      <Flex
        align="center"
        h="66px"
        px={3}
        borderBottom="1px solid"
        borderColor="border.main"
        gap={collapsed ? 2 : 0}
      >
        <IconButton
          size="sm"
          mx={2}
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

      <Box
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        css={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <NavigationMenu collapsed={collapsed} />
      </Box>

      <Box mt="auto" transition="left 0.2s">
        <UserMenu collapsed={collapsed} />
      </Box>
    </Flex>
  );
};
