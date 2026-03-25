import { ResultStatus } from '@/types';

import { type StatPalette, type StatPaletteKey } from './types';

export const STAT_PALETTES: Record<StatPaletteKey, StatPalette & { text: string, count: string }> = {
  total: {
    accent: 'status.total.icon',
    background: 'status.total.bg',
    text: 'status.total.text',
    count: 'status.total.count',
  },
  [ResultStatus.Passed]: {
    accent: 'status.success.icon',
    background: 'status.success.bg',
    text: 'status.success.text',
    count: 'status.success.count',  
  },
  [ResultStatus.Failed]: {
    accent: 'status.error.icon',
    background: 'status.error.bg',
    text: 'status.error.text',
    count: 'status.error.count',
  },
  [ResultStatus.Skipped]: {
    accent: 'status.neutral.icon',
    background: 'status.neutral.bg',
    text: 'status.neutral.text',
    count: 'status.neutral.count',
  },
  [ResultStatus.TimedOut]: {
    accent: 'status.attention.icon',
    background: 'status.attention.bg',
    text: 'status.attention.text',
    count: 'status.attention.count',
  },
};
