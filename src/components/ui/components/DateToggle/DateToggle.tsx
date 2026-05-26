// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { DateWithStats, DateList } from './components';

interface DateToggleProps {
  days: {
    yyyy_mm_dd: string;
    display: string;
    isActive: boolean;
    stats?: string[];
  }[];
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
  variant?: 'default' | 'stats';
  size?: 'default' | 'small';
  isBorder?: boolean;
}

export const DateToggle = ({
  days,
  toggleHandler,
  variant = 'default',
  size = 'default',
  isBorder = true,
}: DateToggleProps) => {
  if (!days || days.length === 0) {
    return null;
  }

  if (variant === 'stats') {
    return days.map((day) => (
      <DateWithStats key={day.yyyy_mm_dd} day={{ ...day, stats: day.stats ?? [] }} toggleHandler={toggleHandler} />
    ));
  }

  return <DateList days={days} toggleHandler={toggleHandler} size={size} isBorder={isBorder} />;
};
