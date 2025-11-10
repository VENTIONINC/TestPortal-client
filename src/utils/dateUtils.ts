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
