// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router';

import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Link } from '@/components/ui/link';
import { PATHS } from '@/types/paths';

export function ReportGeneratorPage() {
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === PATHS.REPORT_GENERATOR_CTRF) return 'ctrf';
    if (location.pathname === PATHS.REPORT_GENERATOR_PLAYWRIGHT) return 'playwright';
    return 'playwright';
  };

  return (
    <MainTemplate pageHeader="Prompts">
      <Container maxW="6xl" py={4}>
        <Tabs.Root value={getActiveTab()}>
          <Tabs.List>
            <Link href={PATHS.REPORT_GENERATOR_PLAYWRIGHT}>
              <Tabs.Trigger value="playwright">Playwright</Tabs.Trigger>
            </Link>
            <Link href={PATHS.REPORT_GENERATOR_CTRF}>
              <Tabs.Trigger value="ctrf">CTRF</Tabs.Trigger>
            </Link>
          </Tabs.List>

          <Box pt={2}>
            <Outlet />
          </Box>
        </Tabs.Root>
      </Container>
    </MainTemplate>
  );
}
