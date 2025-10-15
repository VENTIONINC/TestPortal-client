import { Box, Container, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
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
    <Box minH="100vh">
      <AppHeader />

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
    </Box>
  );
}
