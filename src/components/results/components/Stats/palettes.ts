import { ResultStatus } from '@/types';

import { type StatPalette, type StatPaletteKey } from './types';

export const STAT_PALETTES: Record<StatPaletteKey, StatPalette & { text: string }> = {
  total: {
    accent: 'status.neutral.icon',
    background: 'status.neutral.bg',
    text: 'status.neutral.text',
  },
  [ResultStatus.Passed]: {
    accent: 'status.success.icon',
    background: 'status.success.bg',
    text: 'status.success.text',
  },
  [ResultStatus.Failed]: {
    accent: 'status.error.icon',
    background: 'status.error.bg',
    text: 'status.error.text',
  },
  [ResultStatus.Skipped]: {
    accent: 'status.neutral.icon',
    background: 'status.neutral.bg',
    text: 'status.neutral.text',
  },
  [ResultStatus.TimedOut]: {
    accent: 'status.attention.icon',
    background: 'status.attention.bg',
    text: 'status.attention.text',
  },
};
