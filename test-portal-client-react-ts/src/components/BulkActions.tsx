import React, { useMemo, useCallback } from 'react';
import { HStack, Text } from '@chakra-ui/react';
import Tippy from '@tippyjs/react';
import { LuCheck, LuTrash } from 'react-icons/lu';

import { useBulkReviewMutation } from '@/redux/apis/resultsApi';
import { useConfirmAssumptionMutation } from '@/redux/apis/assumptionsApi';
import { BaseResult } from '@/types';

import 'tippy.js/dist/tippy.css';
import '../styles/BulkActions.css';

interface BulkActionsProps {
  selectedResults: BaseResult[];
}

const BulkActions = ({ selectedResults }: BulkActionsProps) => {
  const unreviewedResults = useMemo(
    () =>
      selectedResults.filter(({ errors }) =>
        errors.some((error) => !error.assumptions || error.assumptions.length === 0),
      ),
    [selectedResults],
  );

  const unconfirmedResults = useMemo(
    () =>
      selectedResults.filter(
        ({ errors }) =>
          errors &&
          errors.some((error) => error.assumptions && error.assumptions.some((assumption) => !assumption.isConfirmed)),
      ),
    [selectedResults],
  );

  const [bulkReview] = useBulkReviewMutation();
  const [confirmAssumption] = useConfirmAssumptionMutation();

  const runAutoReview = useCallback(async () => {
    if (unreviewedResults.length === 0) return;

    const errorIds = unreviewedResults
      .flatMap(({ errors }) => errors?.map((error) => error.id) || [])
      .filter((id) => id !== undefined && id !== null);

    try {
      const response = await bulkReview({ errorIds });

      if (response.error) {
        return alert(`Auto review failed: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during auto review process:', error);
      alert(`An error occurred during auto review: ${(error as Error).message}`);
    }
  }, [unreviewedResults, bulkReview]);

  const confirmAll = useCallback(async () => {
    if (unconfirmedResults.length === 0) return;

    for (const result of unconfirmedResults) {
      const unconfirmedAssumptions = result.errors.flatMap((error) =>
        error.assumptions.filter((assumption) => !assumption.isConfirmed && assumption.id !== undefined),
      );

      await Promise.all(
        unconfirmedAssumptions.map((assumption) =>
          confirmAssumption({ id: assumption.id, madeBy: 'user', isConfirmed: true }),
        ),
      );
    }
  }, [confirmAssumption, unconfirmedResults]);

  const rejectAll = useCallback(async () => {
    if (unconfirmedResults.length === 0) return;

    for (const result of unconfirmedResults) {
      const unconfirmedAssumptions = result.errors.flatMap((error) =>
        error.assumptions.filter((assumption) => !assumption.isConfirmed && assumption.id !== undefined),
      );

      await Promise.all(
        unconfirmedAssumptions.map((assumption) =>
          confirmAssumption({ id: assumption.id, madeBy: 'user', isConfirmed: false }),
        ),
      );
    }
  }, [confirmAssumption, unconfirmedResults]);

  if (selectedResults.length <= 1) {
    return null;
  }

  return (
    <HStack border="1px solid" borderColor="purple.700" borderRadius="md" p={1} bg="white">
      <Text textStyle="sm" color="purple.700">
        Bulk actions
      </Text>

      {unreviewedResults.length > 0 && (
        <Tippy content={`Run auto review for ${unreviewedResults.length} results`} arrow={true}>
          <button
            aria-label="Run auto review"
            className="auto-review bulk-action-button"
            onClick={runAutoReview}
          ></button>
        </Tippy>
      )}

      {unconfirmedResults.length > 0 && (
        <>
          <Tippy content={`Confirm ${unconfirmedResults.length} assumptions`} arrow={true}>
            <LuCheck color="green" size={24} onClick={confirmAll} style={{ cursor: 'pointer' }} />
          </Tippy>
          <Tippy content={`Reject ${unconfirmedResults.length} assumptions`} arrow={true}>
            <LuTrash color="red" size={24} onClick={rejectAll} style={{ cursor: 'pointer' }} />
          </Tippy>
        </>
      )}
    </HStack>
  );
};

export default BulkActions;
