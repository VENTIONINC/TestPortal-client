import { Box, Container, Tabs } from '@chakra-ui/react';

import { SettingsHeader } from '@/components/SettingsHeader';

import { MCPSettings } from './MCPSettings';
import { PortalSettings } from './PortalSettings';
import { ProjectsSettings } from './ProjectsSettings';

export function UserSettingsPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      <SettingsHeader />

      <Container maxW="4xl" py={8}>
        <Tabs.Root defaultValue="mcp">
          <Tabs.List>
            <Tabs.Trigger value="mcp">MCP</Tabs.Trigger>
            <Tabs.Trigger value="portals">Portal URLs</Tabs.Trigger>
            <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="mcp">
            <Box pt={6}>
              <MCPSettings />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="portals">
            <Box pt={6}>
              <PortalSettings />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="projects">
            <Box pt={6}>
              <ProjectsSettings />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </Box>
  );
}
