import { Box, Grid, GridItem, HStack } from '@chakra-ui/react';
import { useState } from 'react';

import { Breadcrumb } from '@/components/ui';
import { useFilterContext } from '@/contexts/FilterContext';
import { FilterToggleButton } from '@/components/ui/components/Filter/components';

import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { BasicWrapper } from './BasicWrapper';
interface MainTemplateProps {
  children: React.ReactNode;
  pageHeader: string;
  actionButton?: React.ReactNode;
  isIncludeBreadcrumb?: boolean;
  isFilterVisible?: boolean;
}

const getInitialCollapsedState = () => {
  const item = localStorage.getItem('sidebar_collapsed');
  return item ? JSON.parse(item) : false;
};

const setCollapsedState = (collapsed: boolean) => {
  localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  return !collapsed;
};

export const MainTemplate = ({
  children,
  pageHeader,
  actionButton,
  isIncludeBreadcrumb,
  isFilterVisible,
}: MainTemplateProps) => {
  const [collapsed, setCollapsed] = useState(() => getInitialCollapsedState());
  const handleSetCollapsed = () => setCollapsed((prev: boolean) => setCollapsedState(prev));

  const { toggleFilters } = useFilterContext();

  const headerAction = (
    <HStack gap={2}>
      {isFilterVisible && <FilterToggleButton onClick={toggleFilters} />}
      {actionButton}
    </HStack>
  );

  return (
    // <Box minH="100vh" maxH="100%" bg={surfaces.page} display="flex" flexDirection="column">
    <>
      <Grid
        templateColumns={`${collapsed ? '64px' : '250px'} 1fr`}
        flex="1"
        transition="grid-template-columns 0.2s ease-in-out"
      >
        <GridItem>
          <Sidebar collapsed={collapsed} setCollapsed={handleSetCollapsed} />
        </GridItem>

        <GridItem>
          <Header title={pageHeader} actionButton={headerAction} isIncludeBreadcrumb={isIncludeBreadcrumb} />

          <BasicWrapper>
            {isIncludeBreadcrumb && <Breadcrumb ml={6} />}
            {children}
          </BasicWrapper>
        </GridItem>
      </Grid>
      {/* </Box> */}
    </>
  );
};
