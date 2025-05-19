import React from 'react';
import type { Execution } from '../utils/models';
import type { ModelledResultRecord } from '../utils/toModels';

// --- Placeholder: ExecutionCard --- (Will be moved to its own file later)
interface ExecutionCardProps {
  execution: Execution;
  resultModels: ModelledResultRecord[];
}

const ExecutionCard: React.FC<ExecutionCardProps> = ({
  execution,
  resultModels,
}) => {
  return (
    <div
      className="execution-card-placeholder card"
      style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #eee' }}
    >
      <h4>Execution ID: {execution.id} (ExecutionCard Placeholder)</h4>
      <p>{resultModels.length} results in this execution.</p>
      {/* Further details can be rendered here */}
    </div>
  );
};
// --- End Placeholder: ExecutionCard ---
export default ExecutionCard;
