import React, { useMemo, useCallback } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import type { ModelledResultRecord } from '../utils/toModels';
import { Assumption } from '../utils/models';
import '../styles/BulkActions.css';

// --- API Response Type Definitions ---
interface ApiAssumptionData {
  id?: string | number;
  isConfirmed?: boolean;
  madeBy?: string;
  issue?: any; // Simplified for API data, actual Issue type is in models.ts
  // Add other properties that might come from the assumption API
  [key: string]: any;
}

interface ApiResultData {
  id: string | number;
  // Add other properties of result from API if needed
}

interface ApiReviewedRecord {
  result?: ApiResultData; // Make result optional if it might not be there
  assumptions?: ApiAssumptionData[];
  // Add other properties of the reviewed record from API
  [key: string]: any;
}
// --- End API Response Type Definitions ---

// Svelte passed `selectedResults` which was Array.from(groups.values()).flat().filter(model => model.result.isSelected);
// So, selectedResults would be an array of { result: Result, execution: Execution, errors: ResultError[], assumptions: Assumption[] (with issue) }
// This is effectively Omit<ModelledResultRecord, 'spec'>[] if 'spec' was the key for groups
// For now, let's use a more general type or ModelledResultRecord itself, assuming 'spec' might still be there or not crucial for bulk actions.

interface BulkActionsProps {
  // The items in Svelte's selectedResults were like Omit<ModelledResultRecord, 'spec'> but filtered for selection.
  // Let's assume for now it's an array of ModelledResultRecord which are selected.
  selectedResults: ModelledResultRecord[];
  onResultsUpdate: (updatedRecords: ModelledResultRecord[]) => void; // Callback to update results in parent
  // Optional: Add a callback for re-fetching all data if preferred over partial updates
  // onDataRefreshNeeded?: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedResults,
  onResultsUpdate,
}) => {
  const unreviewedResults = useMemo(
    () =>
      selectedResults.filter(
        ({ assumptions }) => !assumptions || assumptions.length === 0
      ),
    [selectedResults]
  );
  const unreviewedCount = useMemo(
    () => unreviewedResults.length,
    [unreviewedResults]
  );

  const unconfirmedResults = useMemo(
    () =>
      selectedResults.filter(
        ({ assumptions }) =>
          assumptions &&
          assumptions.some((assumption) => !assumption.isConfirmed)
      ),
    [selectedResults]
  );
  const unconfirmedCount = useMemo(
    () => unconfirmedResults.length,
    [unconfirmedResults]
  );

  const runAutoReview = useCallback(async () => {
    if (unreviewedResults.length === 0) return;

    const errorIds = unreviewedResults
      .flatMap((model) => model.errors?.map((error) => error.id) || [])
      .filter((id) => id !== undefined && id !== null);

    try {
      const response = await fetch(
        'http://localhost:3001/api/result-errors/bulk-review',
        {
          method: 'PATCH',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ errorIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Auto review failed:', errorData);
        alert(`Auto review failed: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const reviewedApiRecords: ApiReviewedRecord[] = await response.json();
      const updatedResultsMap = new Map<
        string | number,
        ModelledResultRecord
      >();

      unreviewedResults.forEach((originalModel) => {
        const matchingReviewedApiRecord = reviewedApiRecords.find(
          (apiRec) => apiRec.result?.id === originalModel.result.id
        );
        if (
          matchingReviewedApiRecord &&
          matchingReviewedApiRecord.assumptions
        ) {
          const newModel = {
            ...originalModel,
            assumptions: [
              ...(originalModel.assumptions || []),
              ...matchingReviewedApiRecord.assumptions.map(
                (asmData: ApiAssumptionData) => new Assumption(asmData)
              ),
            ],
          };
          updatedResultsMap.set(originalModel.result.id, newModel);
        }
      });

      if (updatedResultsMap.size > 0) {
        const finalUpdates = selectedResults.map(
          (sr) => updatedResultsMap.get(sr.result.id) || sr
        );
        onResultsUpdate(
          finalUpdates.filter((r) => updatedResultsMap.has(r.result.id))
        );
      }
    } catch (error) {
      console.error('Error during auto review process:', error);
      alert(
        `An error occurred during auto review: ${(error as Error).message}`
      );
    }
  }, [unreviewedResults, onResultsUpdate, selectedResults]);

  const confirmAll = useCallback(async () => {
    if (unconfirmedResults.length === 0) return;
    const resultsToUpdate: ModelledResultRecord[] = [];

    for (const model of unconfirmedResults) {
      let modelChanged = false;
      const newAssumptions: Assumption[] = await Promise.all(
        model.assumptions.map(async (asm: Assumption): Promise<Assumption> => {
          if (!asm.isConfirmed && asm.id !== undefined) {
            try {
              const response = await fetch(
                `http://localhost:3001/api/assumptions/${asm.id}`,
                {
                  method: 'PATCH',
                  headers: { 'Content-type': 'application/json' },
                  body: JSON.stringify({ madeBy: 'user', isConfirmed: true }),
                }
              );
              if (response.ok) {
                modelChanged = true;
                const constructorData: Partial<ApiAssumptionData> = {
                  id: asm.id,
                  isConfirmed: true,
                  madeBy: 'user',
                };
                if (asm.issue) constructorData.issue = asm.issue;
                return new Assumption(constructorData as ApiAssumptionData);
              }
            } catch (error) {
              console.error(`Failed to confirm assumption ${asm.id}:`, error);
            }
          }
          return asm;
        })
      );
      if (modelChanged) {
        resultsToUpdate.push({
          ...model,
          assumptions: newAssumptions,
        });
      }
    }
    if (resultsToUpdate.length > 0) {
      onResultsUpdate(resultsToUpdate);
    }
  }, [unconfirmedResults, onResultsUpdate]);

  const rejectAll = useCallback(async () => {
    if (unconfirmedResults.length === 0) return;
    const resultsToUpdate: ModelledResultRecord[] = [];

    for (const model of unconfirmedResults) {
      const newAssumptionsList: Assumption[] = [];
      let modelChanged = false;
      for (const asm of model.assumptions) {
        if (!(asm as any).isConfirmed && (asm as any).id !== undefined) {
          try {
            const response = await fetch(
              `http://localhost:3001/api/assumptions/${(asm as any).id}`,
              {
                method: 'PATCH',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ madeBy: 'user', isConfirmed: false }),
              }
            );
            if (response.ok) {
              modelChanged = true;
              console.log(`Rejected assumption #${(asm as any).id}`);
            } else {
              newAssumptionsList.push(asm);
            }
          } catch (error) {
            console.error(
              `Failed to reject assumption ${(asm as any).id}:`,
              error
            );
            newAssumptionsList.push(asm);
          }
        } else {
          newAssumptionsList.push(asm);
        }
      }
      if (modelChanged) {
        resultsToUpdate.push({
          ...model,
          assumptions: newAssumptionsList,
        });
      }
    }
    if (resultsToUpdate.length > 0) {
      onResultsUpdate(resultsToUpdate);
    }
  }, [unconfirmedResults, onResultsUpdate]);

  if (selectedResults.length <= 1) {
    return null; // Render nothing if not enough items selected
  }

  return (
    <div className="bulk-section">
      <p className="bulk-title">Bulk actions</p>

      {unreviewedCount > 0 && (
        <Tippy
          content={`Run auto review for ${unreviewedCount} results`}
          arrow={true}
        >
          <button
            aria-label="Run auto review"
            className="auto-review bulk-action-button"
            onClick={runAutoReview}
          ></button>
        </Tippy>
      )}

      {unconfirmedCount > 0 && (
        <>
          <Tippy
            content={`Confirm ${unconfirmedCount} assumptions`}
            arrow={true}
          >
            <button
              aria-label="Confirm assumptions"
              className="confirm-issue bulk-action-button"
              onClick={confirmAll}
            ></button>
          </Tippy>
          <Tippy
            content={`Reject ${unconfirmedCount} assumptions`}
            arrow={true}
          >
            <button
              aria-label="Reject assumptions"
              className="reject-issue bulk-action-button"
              onClick={rejectAll}
            ></button>
          </Tippy>
        </>
      )}
    </div>
  );
};

export default BulkActions;
