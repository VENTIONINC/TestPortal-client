import { useMemo, useCallback, memo } from 'react';
import { HStack, Text, useToken } from '@chakra-ui/react';
import Tippy from '@tippyjs/react';
import { LuCheck, LuTrash, LuWandSparkles } from 'react-icons/lu';

import { useBulkReviewMutation } from '@/redux/apis/extendedApi';
import { useConfirmAssumptionMutation } from '@/redux/apis/assumptionsApi';
import { BaseResult } from '@/types';

import 'tippy.js/dist/tippy.css';

interface BulkActionsProps {
  selectedResults: BaseResult[];
}

export const BulkActions = memo(({ selectedResults }: BulkActionsProps) => {
  const purple700 = useToken('colors', 'purple.700')[0];

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
          <LuWandSparkles color={purple700} size={16} onClick={runAutoReview} style={{ cursor: 'pointer' }} />
        </Tippy>
      )}

      {unconfirmedResults.length > 0 && (
        <>
          <Tippy content={`Confirm ${unconfirmedResults.length} assumptions`} arrow={true}>
            <LuCheck color="green" size={16} onClick={confirmAll} style={{ cursor: 'pointer' }} />
          </Tippy>
          <Tippy content={`Reject ${unconfirmedResults.length} assumptions`} arrow={true}>
            <LuTrash color="red" size={16} onClick={rejectAll} style={{ cursor: 'pointer' }} />
          </Tippy>
        </>
      )}
    </HStack>
  );
});
