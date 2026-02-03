import { FiGrid, FiFileText, FiAlertTriangle, FiMessageSquare, FiSettings, FiPieChart } from 'react-icons/fi';

import { PATHS } from '@/types/paths';

import { NavigationMenuGroup } from './types';

export const navigationMenuConfig: NavigationMenuGroup[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'dashboard', icon: FiGrid, label: 'Dashboard', path: PATHS.DASHBOARD },
      { id: 'results', icon: FiFileText, label: 'Results', path: PATHS.RESULTS, active: true },
      { id: 'issues', icon: FiAlertTriangle, label: 'Issues', path: PATHS.ISSUES },
      { id: 'prompts', icon: FiMessageSquare, label: 'Prompts', path: PATHS.PROMPTS },
      { id: 'report-generator', icon: FiPieChart, label: 'Report Generator', path: PATHS.REPORT_GENERATOR },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [{ id: 'settings', icon: FiSettings, label: 'Settings', path: PATHS.USER_SETTINGS }],
  },
];
