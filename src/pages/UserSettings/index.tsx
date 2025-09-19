import { Box, Container, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router';

import { SettingsHeader } from '@/components/SettingsHeader';
import { Link } from '@/components/ui/link';
import { PATHS } from '@/types/paths';

export function UserSettingsPage() {
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === PATHS.USER_SETTINGS_MCP) return 'mcp';
    if (location.pathname === PATHS.USER_SETTINGS_PORTALS) return 'portals';
    if (location.pathname === PATHS.USER_SETTINGS_PROJECTS) return 'projects';
    return 'mcp';
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <SettingsHeader />

      <Container maxW="4xl" py={8}>
        <Tabs.Root value={getActiveTab()}>
          <Tabs.List>
            <Link href={PATHS.USER_SETTINGS_MCP}>
              <Tabs.Trigger value="mcp">MCP</Tabs.Trigger>
            </Link>
            <Link href={PATHS.USER_SETTINGS_PORTALS}>
              <Tabs.Trigger value="portals">Portal URLs</Tabs.Trigger>
            </Link>
            <Link href={PATHS.USER_SETTINGS_PROJECTS}>
              <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
            </Link>
          </Tabs.List>

          <Box pt={6}>
            <Outlet />
          </Box>
        </Tabs.Root>
      </Container>
    </Box>
  );
}
