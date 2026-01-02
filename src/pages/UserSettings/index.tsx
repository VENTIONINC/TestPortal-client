import { Box, Container, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router';

import { SettingsHeader } from '@/components/SettingsHeader';
import { Link } from '@/components/ui/link';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { PATHS } from '@/types/paths';

export function UserSettingsPage() {
  const location = useLocation();
  const { surfaces } = useSurfaceColors();

  const getActiveTab = () => {
    if (location.pathname === PATHS.USER_SETTINGS_MCP) return 'mcp';
    if (location.pathname === PATHS.USER_SETTINGS_CONFIGURATION) return 'configuration';
    if (location.pathname === PATHS.USER_SETTINGS_PROJECTS) return 'projects';
    if (location.pathname === PATHS.USER_SETTINGS_UPLOAD_API) return 'upload-api';
    return 'mcp';
  };

  return (
    <Box minH="100vh" bg={surfaces.page}>
      <SettingsHeader />

      <Container maxW="4xl" py={8}>
        <Tabs.Root value={getActiveTab()}>
          <Tabs.List>
            <Link href={PATHS.USER_SETTINGS_MCP}>
              <Tabs.Trigger value="mcp">MCP</Tabs.Trigger>
            </Link>
            <Link href={PATHS.USER_SETTINGS_CONFIGURATION}>
              <Tabs.Trigger value="configuration">Configuration</Tabs.Trigger>
            </Link>
            <Link href={PATHS.USER_SETTINGS_PROJECTS}>
              <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
            </Link>
            <Link href={PATHS.USER_SETTINGS_UPLOAD_API}>
              <Tabs.Trigger value="upload-api">Upload API Keys</Tabs.Trigger>
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
