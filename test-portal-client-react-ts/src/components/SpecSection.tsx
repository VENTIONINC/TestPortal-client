import { useMemo } from 'react';

import { BaseResult, ResultExecution, ResultSpec } from '@/types';
import type { DateConfig } from '../utils/dateRange';
import { toCleanTitle } from '../utils/date-time.converter';
import '../styles/SpecSection.css';
import DateToggle from './DateToggle';
import ExecutionCard from './ExecutionCard';

interface SpecSectionProps {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
  dateConfigs: DateConfig[];
  onDateToggle: (dateKey: string) => void;
  selectedResultsIds: number[];
  onSelectResult: (resultId: number) => void;
}

export const SpecSection = ({
  spec,
  executions,
  dateConfigs,
  onDateToggle,
  selectedResultsIds,
  onSelectResult,
}: SpecSectionProps) => {
  const dateFilters = useMemo(() => {
    return dateConfigs.map((focus) => {
      const statuses = executions
        .filter(({ results }) => results.some((result) => result.startTime.split('T')[0] === focus.date))
        .flatMap(({ results }) => results.map((result) => result.status));

      return {
        yyyy_mm_dd: focus.date,
        stats: statuses,
        isActive: focus.isActive,
        display: focus.name,
      };
    });
  }, [dateConfigs, executions]);

  const filteredExecutions = useMemo(() => {
    const activeDates = dateConfigs.filter((day) => day.isActive).map(({ date }) => date);

    return executions.filter(({ results }) =>
      results.some((result) => activeDates.includes(result.startTime.split('T')[0])),
    );
  }, [executions, dateConfigs]);

  const handleDateToggle = (dayFilter: { yyyy_mm_dd: string }) => {
    onDateToggle(dayFilter.yyyy_mm_dd);
  };

  if (!dateFilters.some((day) => day.stats.length !== 0 && day.isActive)) {
    return null;
  }

  return (
    <div className="spec-section-container">
      <div className="row date-toggles-row" style={{ marginBottom: '1rem', display: 'flex' }}>
        {dateFilters.map((day) => (
          <DateToggle key={day.yyyy_mm_dd} day={day} toggleHandler={handleDateToggle} />
        ))}
      </div>

      <div className="spec-details-card">
        <div className="spec-details-card-header">
          <p>{spec.key}</p>
          <p>{spec.file}</p>

          <div className="spec-tags">
            {spec.tags?.map((tag: string) => (
              <p key={tag} className="tag-item">
                <img
                  src="https://icongr.am/clarity/tag.svg?size=10&color=currentColor"
                  alt="tag icon"
                  className="icon"
                />
                {tag}
              </p>
            ))}
          </div>
        </div>

        <div className="row spec-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* {issueAnnotations.length > 0 && (
            <div className="col issue-links" style={{ display: 'flex', alignItems: 'center' }}>
              {issueAnnotations.map((annotation: Annotation, index: number) => (
                <a
                  key={index}
                  href={annotation.description}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="issue-link"
                  style={{ marginRight: '0.5rem', fontSize: '0.9em' }}
                >
                  <img
                    src="https://icongr.am/clarity/link.svg?size=10&color=currentColor"
                    alt="link icon"
                    className="icon"
                    style={{ marginRight: '0.2rem' }}
                  />
                  Jira Issue {issueAnnotations.length > 1 ? index + 1 : ''}
                </a>
              ))}
            </div>
          )} */}

          <p className="spec-title">
            <img
              src="https://icongr.am/clarity/avatar.svg?size=10&color=currentColor"
              alt="avatar icon"
              className="icon"
            />
            {toCleanTitle(spec.title)}
          </p>
        </div>
      </div>

      {filteredExecutions.map(({ execution, results }) => (
        <ExecutionCard
          key={execution.id}
          execution={execution}
          results={results}
          selectedResultsIds={selectedResultsIds}
          onSelectResult={onSelectResult}
        />
      ))}
    </div>
  );
};
