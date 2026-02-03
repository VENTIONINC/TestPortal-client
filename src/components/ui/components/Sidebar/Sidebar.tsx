import { useState } from 'react';
import { Flex, IconButton, Spacer } from '@chakra-ui/react';
// import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiChevronLeft } from 'react-icons/fi';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

import { NavigationMenu } from '../NavigationMenu';
import { UserMenu } from '../UserMenu';
import { Logo, FullLogo } from './components';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { surfaces, borders, text } = useSurfaceColors();

  return (
    <Flex
      h="100vh"
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
        justify={collapsed ? 'center' : 'space-between'}
        gap={collapsed ? 2 : 0}
        flexDir={collapsed ? 'column-reverse' : 'row'}
      >
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          transition="all 0.2s"
          transform={collapsed ? 'rotate(180deg)' : 'rotate(0deg)'}
        >
          <FiChevronLeft />
        </IconButton>
        {collapsed ? <Logo /> : <FullLogo />}
      </Flex>

      {/* Navigation */}
      <NavigationMenu collapsed={collapsed} />
      <Spacer />

      <UserMenu collapsed={collapsed} />
    </Flex>
  );
};
