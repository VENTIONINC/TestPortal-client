// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

export const toStartTime = (date: string | Date): string => {
  if (!date) {
    throw new Error('Unable to convert toStartTime: missing date');
  }

  const value: Date = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(value);
};

export const toDuration = (
  duration: string | number | null | undefined
): string => {
  if (!duration) {
    // handles null, undefined, empty string, 0
    return '';
  }

  const ms: number = typeof duration === 'string' ? Number(duration) : duration;
  // Add a check for NaN if Number(duration) could result in NaN from an invalid string
  if (isNaN(ms)) {
    return ''; // Or throw an error, or return a specific format for invalid input
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(
    2,
    '0'
  )}s`;
};

export const toCleanTitle = (title: string): string => {
  const isTestKey = (v: string): boolean => /<\D.+>/.test(v);
  const isTag = (v: string): boolean => v.startsWith('@');

  return title
    .split(' ')
    .filter((v) => !isTestKey(v) && !isTag(v))
    .join(' ');
};

export const getDaysDiff = (from: Date, to: Date): number => {
  const MS_IN_DAY = 86_400_000; // number of milliseconds in a day
  // Ensure 'from' and 'to' are valid Date objects before subtraction
  if (
    !(from instanceof Date) ||
    !(to instanceof Date) ||
    isNaN(from.getTime()) ||
    isNaN(to.getTime())
  ) {
    // Or throw error, or return NaN
    return 0;
  }
  return (to.getTime() - from.getTime()) / MS_IN_DAY;
};
