import { Box, Container, Heading, Text, Tabs } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';

import { MCPSettings } from './MCPSettings';
import { PortalSettings } from './PortalSettings';
import { ProjectsSettings } from './ProjectsSettings';

export function UserSettingsPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      <AppHeader />
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
        <Container maxW="6xl">
          <Box>
            <Heading size="lg">User Settings</Heading>
            <Text color="gray.600" fontSize="sm">
              Manage your account settings and API keys
            </Text>
          </Box>
        </Container>
      </Box>

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
