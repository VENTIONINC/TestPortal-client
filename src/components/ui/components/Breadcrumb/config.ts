// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

// export enum PATHS {
//   ROOT = '/',
//   DASHBOARD = '/dashboard',
//   RESULTS = '/results',
//   ISSUES = '/issues',
//   LOGIN = '/login',
//   SIGNUP = '/signup',
//   USER_SETTINGS = '/settings',
//   USER_SETTINGS_MCP = '/settings/mcp',
//   USER_SETTINGS_CONFIGURATION = '/settings/configuration',
//   USER_SETTINGS_PROJECTS = '/settings/projects',
//   USER_SETTINGS_UPLOAD_API = '/settings/upload-api',
//   USER_SETTINGS_INFO = '/settings/info',
//   PROMPTS = '/prompts',
//   PROMPT_BUILDER = '/prompts/:name',
//   REPORT_GENERATOR = '/report-generator',
//   REPORT_GENERATOR_PLAYWRIGHT = '/report-generator/playwright',
//   REPORT_GENERATOR_CTRF = '/report-generator/ctrf',
//   NOT_FOUND = '*',
// }

import { PATHS } from '@/types/paths';
import { configHeaderPageTitles } from '@/configs/pageTitleConfig';

export const routerConfig = {
  [PATHS.USER_SETTINGS_MCP]: [{ title: 'Settings', url: PATHS.USER_SETTINGS }, { title: 'MCP' }],
  [PATHS.USER_SETTINGS_CONFIGURATION]: [{ title: 'Settings', url: PATHS.USER_SETTINGS }, { title: 'Configuration' }],
  [PATHS.USER_SETTINGS_PROJECTS]: [{ title: 'Settings', url: PATHS.USER_SETTINGS }, { title: 'Projects' }],
  [PATHS.USER_SETTINGS_UPLOAD_API]: [{ title: 'Settings', url: PATHS.USER_SETTINGS }, { title: 'Upload API Keys' }],
  [PATHS.USER_SETTINGS_INFO]: [{ title: 'Settings', url: PATHS.USER_SETTINGS }, { title: 'Info' }],
  [PATHS.REPORT_GENERATOR_PLAYWRIGHT]: [
    { title: 'Report Generator', url: PATHS.REPORT_GENERATOR },
    { title: 'Playwright' },
  ],
  ...Object.entries(configHeaderPageTitles).reduce(
    (acc, [key, title]) => {
      acc[`${PATHS.PROMPT_BUILDER.replace(':name', key)}`] = [{ title: 'Prompts', url: PATHS.PROMPTS }, { title }];
      return acc;
    },
    {} as Record<string, Array<{ title: string; url?: string }>>,
  ),
  [PATHS.REPORT_GENERATOR_CTRF]: [{ title: 'Report Generator', url: PATHS.REPORT_GENERATOR }, { title: 'CTRF' }],
};
