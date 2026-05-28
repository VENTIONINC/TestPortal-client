// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router';

import { Link } from '@/components/ui/link';
import { PATHS } from '@/types/paths';
import { MainTemplate } from '@/components/ui/components';
export function UserSettingsPage() {
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === PATHS.USER_SETTINGS_USERS) return 'users';
    if (location.pathname === PATHS.USER_SETTINGS_MCP) return 'mcp';
    if (location.pathname === PATHS.USER_SETTINGS_CONFIGURATION) return 'configuration';
    if (location.pathname === PATHS.USER_SETTINGS_PROJECTS) return 'projects';
    if (location.pathname === PATHS.USER_SETTINGS_UPLOAD_API) return 'upload-api';
    if (location.pathname === PATHS.USER_SETTINGS_INFO) return 'info';
    return 'mcp';
  };

  return (
    <MainTemplate pageHeader="Settings">
      <Container maxW="800px" centerContent={false} ml={0} px={0}>
        <Tabs.Root value={getActiveTab()}>
          <Tabs.List>
            <Link href={PATHS.USER_SETTINGS_USERS}>
              <Tabs.Trigger value="users">Users</Tabs.Trigger>
            </Link>
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
            <Link href={PATHS.USER_SETTINGS_INFO}>
              <Tabs.Trigger value="info">Info</Tabs.Trigger>
            </Link>
          </Tabs.List>
          <Box pt="17px">
            <Outlet />
          </Box>
        </Tabs.Root>
      </Container>
    </MainTemplate>
  );
}
