// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router';

import { MainTemplate } from '@/components/ui/components';
import { Link } from '@/components/ui/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import { getActiveSettingsTab, getVisibleSettingsTabs } from './SettingsNavigation';

export function UserSettingsPage() {
  const location = useLocation();
  const currentUser = useCurrentUser();
  const visibleTabs = getVisibleSettingsTabs(currentUser.role);
  const activeTab = getActiveSettingsTab(location.pathname, currentUser.role);

  return (
    <MainTemplate pageHeader="Settings">
      <Container maxW="800px" centerContent={false} ml={0} px={0}>
        <Tabs.Root value={activeTab}>
          <Tabs.List>
            {visibleTabs.map((tab) => (
              <Link key={tab.value} href={tab.path}>
                <Tabs.Trigger value={tab.value}>{tab.label}</Tabs.Trigger>
              </Link>
            ))}
          </Tabs.List>
          <Box pt="17px">
            <Outlet />
          </Box>
        </Tabs.Root>
      </Container>
    </MainTemplate>
  );
}
