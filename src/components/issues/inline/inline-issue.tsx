// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { HStack, IconButton, Text } from '@chakra-ui/react';
import { LuCheck, LuTrash, LuCirclePlus } from 'react-icons/lu';

import { useAssignIssueModalDialog } from '@/components/results/assign-issue-modal';
import { useConfirmAssumptionMutation } from '@/redux/apis/extendedApi';
import { getIssueCategoryStyle } from '@/utils';
import { ResultCategory, ResultError, ResultErrorAssumption } from '@/types';

interface InlineIssueProps {
  resultError: ResultError;
  projectId: string;
  category?: ResultCategory;
}

export const InlineIssue = memo(({ resultError, projectId, category }: InlineIssueProps) => {
  const [confirmAssumption] = useConfirmAssumptionMutation();

  const openAssignIssueModal = useAssignIssueModalDialog(projectId);

  const confirm = async (assumption: ResultErrorAssumption, isConfirmed: boolean) => {
    await confirmAssumption({
      assumptionId: assumption.id.toString(),
      updateAssumptionRequest: { isConfirmed, madeBy: 'user' },
    });
  };

  return (
    <>
      {resultError.assumptions && resultError.assumptions.length ? (
        resultError.assumptions.map((assumption, index) => {
          if (!assumption) return null;

          const categoryStyle = category ? getIssueCategoryStyle(category) : null;

          const isConfirmed = assumption.isConfirmed;

          return (
            <HStack
              key={index}
              border={isConfirmed ? '1px solid' : '1px dashed'}
              borderColor={isConfirmed && categoryStyle ? categoryStyle.color : 'border.muted'}
              borderRadius="xl"
              ml="auto"
              px={2}
              minH="26px"
              color={isConfirmed && categoryStyle ? 'white' : 'fg.muted'}
              bg={isConfirmed && categoryStyle ? categoryStyle.color : 'transparent'}
              flexShrink={0}
              onClick={() =>
                isConfirmed
                  ? openAssignIssueModal(resultError, 'confirmed')
                  : openAssignIssueModal(resultError, 'assign', assumption.id.toString())
              }
              cursor="pointer"
              _hover={{ opacity: 0.85 }}
            >
              {assumption.issue && (
                <>
                  {categoryStyle && (
                    <categoryStyle.Icon
                      size={14}
                      color="currentColor"
                      style={{ flexShrink: 0 }}
                      aria-label={`Category: ${categoryStyle.name}`}
                    />
                  )}
                  <Text fontSize="xs" fontWeight={isConfirmed ? 'bold' : 'normal'} whiteSpace="nowrap">
                    {isConfirmed ? '[Confirmed]' : '[Hypothesis]'}: {assumption.issue.name}
                  </Text>
                </>
              )}

              {!isConfirmed && (
                <>
                  <Text color="text.secondary" fontSize="xs" fontWeight="bold">
                    ({Math.round(assumption.score * 100)}%)
                  </Text>
                  <LuCheck
                    color="green"
                    size={15}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirm(assumption, true);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <LuTrash
                    color="red"
                    size={15}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirm(assumption, false);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </>
              )}
            </HStack>
          );
        })
      ) : (
        <>
          <IconButton
            aria-label="Assign issue"
            size="xs"
            variant="ghost"
            ms="auto"
            onClick={() => openAssignIssueModal(resultError, 'assign')}
          >
            <LuCirclePlus size={20} />
          </IconButton>
        </>
      )}
    </>
  );
});
