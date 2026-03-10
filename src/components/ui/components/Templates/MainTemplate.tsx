import { Grid, GridItem } from '@chakra-ui/react';
import { useState } from 'react';

import { Breadcrumb } from '@/components/ui';

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
  const handleSetCollapsed = () =>
    setCollapsed((prev: boolean) => {
      const newState = !prev;
      setCollapsedState(newState);
      return newState;
    });

  return (
    <Grid
      templateColumns={`${collapsed ? '64px' : '250px'} 1fr`}
      flex="1"
      transition="grid-template-columns 0.2s ease-in-out"
    >
      <GridItem>
        <Sidebar collapsed={collapsed} handleSetCollapsed={handleSetCollapsed} />
      </GridItem>

      <GridItem>
        <Header title={pageHeader} actionButton={actionButton} />

        <BasicWrapper>
          {isIncludeBreadcrumb && <Breadcrumb ml={6} />}
          {children}
        </BasicWrapper>
      </GridItem>
    </Grid>
  );
};
