// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

export enum PATHS {
  ROOT = '/',
  DASHBOARD = '/dashboard',
  RESULTS = '/results',
  ISSUES = '/issues',
  LOGIN = '/login',
  SIGNUP = '/signup',
  USER_SETTINGS = '/settings',
  USER_SETTINGS_USERS = '/settings/users',
  USER_SETTINGS_MCP = '/settings/mcp',
  USER_SETTINGS_CONFIGURATION = '/settings/configuration',
  USER_SETTINGS_PROJECTS = '/settings/projects',
  USER_SETTINGS_UPLOAD_API = '/settings/upload-api',
  USER_SETTINGS_INFO = '/settings/info',
  PROMPTS = '/prompts',
  PROMPT_BUILDER = '/prompts/:name',
  REPORT_GENERATOR = '/report-generator',
  REPORT_GENERATOR_PLAYWRIGHT = '/report-generator/playwright',
  REPORT_GENERATOR_CTRF = '/report-generator/ctrf',
  NOT_FOUND = '*',
}
