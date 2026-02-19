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
}

export const DateToggle = ({ days, toggleHandler, variant = 'default' }: DateToggleProps) => {
  if (!days || days.length === 0) {
    return null;
  }

  if (variant === 'stats') {
    return days.map((day) => (
      <DateWithStats
        key={day.yyyy_mm_dd}
        day={{ ...day, stats: day.stats ?? [] }}
        toggleHandler={toggleHandler}
      />
    ));
  }

  return <DateList days={days} toggleHandler={toggleHandler} />;
};
