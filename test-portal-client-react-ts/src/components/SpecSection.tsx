import React, { useMemo } from 'react';
import { Spec, Execution, Issue as Annotation } from '../utils/models';
import type { ModelledResultRecord } from '../utils/toModels';
import type { DateConfig } from '../utils/dateRange';
import { toCleanTitle } from '../utils/date-time.converter';
import '../styles/SpecSection.css';
import DateToggle from './DateToggle';
import ExecutionCard from './ExecutionCard';

interface SpecSectionProps {
  spec: Spec;
  results: ModelledResultRecord[];
  dateConfigs: DateConfig[];
  onDateToggle: (dateKey: string) => void;
}

const SpecSection: React.FC<SpecSectionProps> = ({
  spec,
  results,
  dateConfigs,
  onDateToggle,
}) => {
  const dateFilters = useMemo(() => {
    return dateConfigs.map((focus) => {
      const statuses = results
        .filter(({ result }) => result.dateKey === focus.date)
        .map(({ result }) => result.status);
      return {
        yyyy_mm_dd: focus.date,
        stats: statuses,
        isActive: focus.isActive,
        display: focus.name,
      };
    });
  }, [dateConfigs, results]);

  const executionsMap = useMemo(() => {
    return results
      .filter(({ result }) => {
        const dayConfig = dateConfigs.find((dc) => dc.date === result.dateKey);
        return dayConfig?.isActive;
      })
      .sort(
        (a, b) =>
          new Date(b.result.startTime).getTime() -
          new Date(a.result.startTime).getTime()
      )
      .reduce((map, record) => {
        const { execution, ...rest } = record;
        if (!map.has(execution.id)) {
          map.set(execution.id, { execution, models: [] });
        }
        map.get(execution.id)!.models.push(rest as ModelledResultRecord);
        return map;
      }, new Map<string, { execution: Execution; models: ModelledResultRecord[] }>());
  }, [results, dateConfigs]);

  const handleDateToggle = (dayFilter: { yyyy_mm_dd: string }) => {
    onDateToggle(dayFilter.yyyy_mm_dd);
  };

  if (!spec) {
    return <div className="spec-section-loading">Loading spec details...</div>;
  }

  const issueAnnotations =
    spec.annotations?.filter((ann: Annotation) => ann.type === 'issue') || [];

  return (
    <div className="spec-section-container">
      <div
        className="row date-toggles-row"
        style={{ marginBottom: '1rem', display: 'flex' }}
      >
        {dateFilters.map((day) => (
          <DateToggle
            key={day.yyyy_mm_dd}
            day={day}
            toggleHandler={handleDateToggle}
          />
        ))}
      </div>

      <div
        className="card spec-details-card"
        style={{
          padding: '1rem',
          border: '1px solid #ddd',
          marginBottom: '1rem',
        }}
      >
        <div
          className="row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}
        >
          <p
            className="col-small"
            style={{ width: '6rem', fontWeight: 'bold' }}
          >
            {spec.key}
          </p>
          <p
            className="col flex-grow-1"
            style={{ flex: 1, marginLeft: '1rem' }}
          >
            {spec.file}
          </p>

          <div className="row spec-tags" style={{ display: 'flex' }}>
            {spec.tags?.map((tag: string) => (
              <p
                key={tag}
                className="col tag-item"
                style={{ marginLeft: '0.5rem', fontSize: '0.9em' }}
              >
                <img
                  src="https://icongr.am/clarity/tag.svg?size=10&color=currentColor"
                  alt="tag icon"
                  className="icon"
                  style={{ marginRight: '0.2rem' }}
                />
                {tag}
              </p>
            ))}
          </div>
        </div>

        <div
          className="row spec-meta"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {issueAnnotations.length > 0 && (
            <div
              className="col issue-links"
              style={{ display: 'flex', alignItems: 'center' }}
            >
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
          )}

          <p className="col spec-title" style={{ fontStyle: 'italic' }}>
            <img
              src="https://icongr.am/clarity/avatar.svg?size=10&color=currentColor"
              alt="avatar icon"
              className="icon"
              style={{ marginRight: '0.2rem' }}
            />
            {toCleanTitle(spec.title)}
          </p>
        </div>
      </div>

      {Array.from(executionsMap.entries()).map(
        ([executionId, { execution, models }]) => (
          <ExecutionCard
            key={executionId}
            execution={execution}
            resultModels={models}
          />
        )
      )}
    </div>
  );
};

export default SpecSection;
