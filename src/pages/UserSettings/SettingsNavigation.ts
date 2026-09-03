// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import type { UserRole } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';

export type SettingsTabValue = 'users' | 'mcp' | 'configuration' | 'projects' | 'upload-api' | 'info';

type SettingsTab = {
  value: SettingsTabValue;
  label: string;
  path: PATHS;
  adminOnly?: boolean;
};

export const SETTINGS_TABS: SettingsTab[] = [
  {
    value: 'users',
    label: 'Users',
    path: PATHS.USER_SETTINGS_USERS,
    adminOnly: true,
  },
  {
    value: 'mcp',
    label: 'MCP',
    path: PATHS.USER_SETTINGS_MCP,
  },
  {
    value: 'configuration',
    label: 'Configuration',
    path: PATHS.USER_SETTINGS_CONFIGURATION,
  },
  {
    value: 'projects',
    label: 'Projects',
    path: PATHS.USER_SETTINGS_PROJECTS,
  },
  {
    value: 'upload-api',
    label: 'Upload API Keys',
    path: PATHS.USER_SETTINGS_UPLOAD_API,
  },
  {
    value: 'info',
    label: 'Info',
    path: PATHS.USER_SETTINGS_INFO,
  },
];

export function getVisibleSettingsTabs(role: UserRole) {
  return SETTINGS_TABS.filter((tab) => !tab.adminOnly || role === 'admin');
}

export function getDefaultSettingsPath(role: UserRole) {
  return role === 'admin' ? PATHS.USER_SETTINGS_USERS : PATHS.USER_SETTINGS_MCP;
}

export function getActiveSettingsTab(pathname: string, role: UserRole): SettingsTabValue {
  const visibleTabs = getVisibleSettingsTabs(role);
  const activeTab = visibleTabs.find((tab) => tab.path === pathname);

  return activeTab?.value ?? visibleTabs[0].value;
}
