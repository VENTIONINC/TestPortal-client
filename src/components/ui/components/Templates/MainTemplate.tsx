// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, GridItem } from '@chakra-ui/react';
import { useState } from 'react';

import { Breadcrumb } from '@/components/ui';
import { useFilterContext } from '@/contexts/FilterContext';

import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { BasicWrapper } from './BasicWrapper';
interface MainTemplateProps {
  children: React.ReactNode;
  pageHeader: string;
  actionButton?: React.ReactNode;
  isIncludeBreadcrumb?: boolean;
}

const getInitialCollapsedState = () => {
  const item = localStorage.getItem('sidebar_collapsed');
  return item ? JSON.parse(item) : false;
};

const setCollapsedState = (collapsed: boolean) => {
  localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  return !collapsed;
};

export const MainTemplate = ({ children, pageHeader, actionButton, isIncludeBreadcrumb }: MainTemplateProps) => {
  const [collapsed, setCollapsed] = useState(() => getInitialCollapsedState());
  const { setShowFilters } = useFilterContext();

  const handleSetCollapsed = () => {
    // Trigger isTransitioning in the filter context to hide charts
    setShowFilters((prev: boolean) => prev);

    setCollapsed((prev: boolean) => {
      const newState = !prev;
      setCollapsedState(newState);
      return newState;
    });
  };

  return (
    <Grid
      templateColumns={`${collapsed ? '64px' : '250px'} 1fr`}
      flex="1"
      h="100vh"
      overflow="hidden"
      transition="grid-template-columns 0.2s ease-in-out"
    >
      <GridItem w={collapsed ? '64px' : '250px'} transition="width 0.2s">
        <Sidebar collapsed={collapsed} handleSetCollapsed={handleSetCollapsed} />
      </GridItem>

      <GridItem
        position="relative"
        h="100vh"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <Box
          position="fixed"
          top="0"
          left={collapsed ? '64px' : '250px'}
          right="0"
          zIndex="20"
          transition="left 0.2s, width 0.2s"
        >
          <Header title={pageHeader} actionButton={actionButton} />
        </Box>

        <BasicWrapper>
          {isIncludeBreadcrumb && <Breadcrumb ml={6} />}
          {children}
        </BasicWrapper>
      </GridItem>
    </Grid>
  );
};
