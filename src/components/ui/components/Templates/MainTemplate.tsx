import { Box, Grid, GridItem } from '@chakra-ui/react';
import { useState } from 'react';

import { useSurfaceColors } from '@/theme/useSurfaceColors';
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

export const MainTemplate = ({ children, pageHeader, actionButton, isIncludeBreadcrumb }: MainTemplateProps) => {
  const { surfaces } = useSurfaceColors();
  const [collapsed, setCollapsed] = useState(false);
  return (
    // <Box minH="100vh" maxH="100%" bg={surfaces.page} display="flex" flexDirection="column">
    <>
      <Grid
        templateColumns={`${collapsed ? '64px' : '250px'} 1fr`}
        flex="1"
        transition="grid-template-columns 0.2s ease-in-out"
      >
        <GridItem>
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </GridItem>

        <GridItem>
          <Header title={pageHeader} actionButton={actionButton} isIncludeBreadcrumb={isIncludeBreadcrumb} />

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
