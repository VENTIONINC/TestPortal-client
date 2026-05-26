// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDatesBetween = (fromDate: string, toDate: string): string[] => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const dates: string[] = [];

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates.reverse();
};

export const getEffectiveDatesInRange = (selectedDates: string[], fromDate: string, toDate: string): string[] => {
  const datesInRange = getDatesBetween(fromDate, toDate);
  const selectedDatesSet = new Set(selectedDates);
  const selectedDatesInRange = datesInRange.filter((date) => selectedDatesSet.has(date));

  return selectedDatesInRange.length > 0 ? selectedDatesInRange : [toDate];
};

export const getDateDisplayName = (date: string): string => {
  const dateObj = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);

  if (dateObj.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateObj.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  }
};

export const calculateDateDiff = (from: string, to: string): number => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  const diffTime = toDate.getTime() - fromDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const adjustDateToWeekRange = (anchorDate: string, isFromField: boolean): string => {
  const anchor = new Date(anchorDate);
  const adjusted = new Date(anchor);
  if (isFromField) {
    adjusted.setDate(anchor.getDate() + 7);
  } else {
    adjusted.setDate(anchor.getDate() - 7);
  }
  return formatDate(adjusted);
};

export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export type DateRangePreset = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month';

export const getPresetDateRange = (preset: DateRangePreset): { from: string; to: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { from: formatDate(today), to: formatDate(today) };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return { from: formatDate(yesterday), to: formatDate(yesterday) };
    }
    case 'this-week': {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return { from: formatDate(monday), to: formatDate(today) };
    }
    case 'last-week': {
      const dayOfWeek = today.getDay();
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      return { from: formatDate(lastMonday), to: formatDate(lastSunday) };
    }
    case 'this-month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: formatDate(firstDay), to: formatDate(today) };
    }
    case 'last-month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: formatDate(firstDay), to: formatDate(lastDay) };
    }
  }
};

export const formatChartLabel = (label: string): string => {
  if (!label) return label;

  // Handle YYYY-Www format (Weekly)
  const weekMatch = label.match(/^(\d{4})-W(\d{2})$/);
  if (weekMatch) {
    const [, year, week] = weekMatch;
    return `Week ${Number.parseInt(week, 10)}, ${year}`;
  }

  // Handle YYYY-MM format (Monthly)
  const monthMatch = label.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch && label.length === 7) {
    const [, year, month] = monthMatch;
    const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  }

  // Handle standard YYYY-MM-DD format (Daily)
  if (label.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return getDateDisplayName(label);
  }

  return label;
};
