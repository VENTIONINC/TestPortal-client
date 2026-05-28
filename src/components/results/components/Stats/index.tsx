// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';

import { type ResultsStatsProps } from './types';
import { StatsBadgeView } from './StatsBadgeView';
import { StatsTagView } from './StatsTagView';

export const ResultsStats = memo(({ typeView = 'badge', ...props }: ResultsStatsProps) => {
  if (typeView === 'tag') {
    return <StatsTagView {...props} />;
  }

  return <StatsBadgeView {...props} />;
});
