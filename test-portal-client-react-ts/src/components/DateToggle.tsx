import React from 'react';

// --- Placeholder: DateToggle --- (Will be moved to its own file later)
interface DateToggleProps {
  day: {
    yyyy_mm_dd: string;
    stats: string[];
    isActive: boolean;
    display: string;
  };
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
}

const DateToggle: React.FC<DateToggleProps> = ({ day, toggleHandler }) => {
  return (
    <div
      className={`day-toggle-placeholder col button ${
        day.isActive ? 'dark' : 'outline'
      }`}
      onClick={() => toggleHandler(day)}
      style={{
        cursor: 'pointer',
        padding: '0.5rem',
        border: '1px solid #ccc',
        marginRight: '0.5rem',
        borderRadius: '4px',
      }}
    >
      <div>{day.display}</div>
      {day.stats && (
        <div style={{ fontSize: '0.8em' }}>
          P: {day.stats.filter((s: string) => s === 'passed').length}, F:{' '}
          {day.stats.filter((s: string) => s === 'failed').length}, S:{' '}
          {day.stats.filter((s: string) => s === 'skipped').length}
        </div>
      )}
    </div>
  );
};
// --- End Placeholder: DateToggle ---

export default DateToggle;
