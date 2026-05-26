import { ResultStatus } from '@/types';

import { type StatPalette, type StatPaletteKey } from './types';

export const STAT_PALETTES: Record<StatPaletteKey, StatPalette & { text: string; count: string }> = {
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

export const STAT_PALETTES_TAG_VIEW: Record<StatPaletteKey, StatPalette & { text: string; count: string }> = {
  total: {
    accent: 'status.tag.total.icon',
    background: 'status.tag.total.bg',
    text: 'status.tag.total.text',
    count: 'status.tag.total.count',
    icon: 'status.tag.total.icon',
  },
  [ResultStatus.Passed]: {
    accent: 'status.tag.success.icon',
    background: 'status.tag.success.bg',
    text: 'status.tag.success.text',
    count: 'status.tag.success.count',
    icon: 'status.tag.success.icon',
  },
  [ResultStatus.Failed]: {
    accent: 'status.tag.error.icon',
    background: 'status.tag.error.bg',
    text: 'status.tag.error.text',
    count: 'status.tag.error.count',
    icon: 'status.tag.error.icon',
  },
  [ResultStatus.Skipped]: {
    accent: 'status.tag.neutral.icon',
    background: 'status.neutral.bg',
    text: 'status.neutral.text',
    count: 'status.neutral.count',
    icon: 'status.tag.neutral.icon',
  },
  [ResultStatus.TimedOut]: {
    accent: 'status.tag.attention.icon',
    background: 'status.tag.attention.bg',
    text: 'status.tag.attention.text',
    count: 'status.tag.attention.count',
    icon: 'status.tag.attention.icon',
  },
};
