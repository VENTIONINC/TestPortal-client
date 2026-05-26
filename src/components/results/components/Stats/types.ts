// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { type IconType } from 'react-icons';

import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';
import { ResultStatus } from '@/types';

export interface ResultsStatsProps {
  statistics?: ResultsStatsResponse;
  isFetching?: boolean;
  size?: 'small' | 'default';
  typeView?: 'tag' | 'badge';
}

export interface ResultsStatCardProps {
  title: string;
  count: number;
  accent: string;
  background: string;
  labelColor: string;
  valueColor: string;
  shadow: string;
  IconComponent?: IconType;
}

export type StatPaletteKey = 'total' | ResultStatus;

export type StatPalette = {
  accent: string;
  background: string;
  text?: string;
  count?: string;
  icon?: string;
};

export type StatusMeta = {
  title: string;
  Icon: IconType;
};

export type StatusCountKey = keyof ResultsStatsResponse['byStatus'];

export type EntityCountKey = keyof ResultsStatsResponse['entityCounts'];

export interface StatsConfigInfoProps {
  entityCounts: ResultsStatsResponse['entityCounts'];
  labelColor: string;
  valueColor: string;
}
