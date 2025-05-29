import { getDaysDiff } from './date-time.converter';

export interface DateConfig {
  name: string;
  date: string; // YYYY-MM-DD
  isActive: boolean;
}

// Date formatter for YYYY-MM-DD (en-CA like)
const formatDateEnCA = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateRangeMap = (filterFrom: string, filterTo: string): DateConfig[] => {
  const today = new Date();
  const fromDate = new Date(filterFrom); // Renamed to avoid conflict with 'from' keyword if it were a module
  const toDate = new Date(filterTo); // Renamed

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    // eslint-disable-next-line no-console
    console.error('Invalid date string provided to getDateRangeMap', {
      filterFrom,
      filterTo,
    });
    return [];
  }

  today.setHours(0, 0, 0, 0);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  if (toDate < fromDate) {
    // eslint-disable-next-line no-console
    console.warn("'To' date is before 'From' date in getDateRangeMap. Returning empty array.", {
      from: fromDate,
      to: toDate,
    });
    return [];
  }

  const diff = getDaysDiff(fromDate, toDate);
  const datesList: Date[] = [];

  for (let i = 0; i <= diff; i++) {
    // Iterate from 0 to diff inclusive
    const day = new Date(toDate);
    day.setDate(toDate.getDate() - i);
    datesList.push(day);
  }
  // datesList will now be [toDate, toDate-1, ..., fromDate]

  return datesList.map((date) => {
    let name = '';
    const timeDiff = today.getTime() - date.getTime();

    switch (timeDiff) {
      case 0:
        name = 'Today';
        break;
      case 86400000:
        name = 'Yesterday';
        break;
      default:
        name = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(date);
        break;
    }

    const dateStringCA = formatDateEnCA(date);
    return {
      name,
      date: dateStringCA,
      isActive: dateStringCA === formatDateEnCA(toDate), // The 'toDate' from original filterTo should be active
    };
  }); // No sort needed if loop generates in descending order
};
