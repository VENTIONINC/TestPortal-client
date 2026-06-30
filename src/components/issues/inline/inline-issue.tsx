// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { LuCheck, LuTrash, LuCirclePlus } from 'react-icons/lu';

import { useManageIssueDrawer } from '@/components/drawers';
import { useConfirmAssumptionMutation } from '@/redux/apis/extendedApi';
import { getIssueCategoryStyle } from '@/utils';
import { ResultError, ResultErrorAssumption } from '@/types';

interface InlineIssueProps {
  resultError: ResultError;
}

export const InlineIssue = memo(({ resultError }: InlineIssueProps) => {
  const [confirmAssumption] = useConfirmAssumptionMutation();

  const openManageIssueDrawer = useManageIssueDrawer({ resultError });

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

          const { Icon, color } = getIssueCategoryStyle(assumption.issue.category);

          const isConfirmed = assumption.isConfirmed;

          return (
            <HStack
              key={index}
              border={isConfirmed ? '1px solid' : '1px dashed'}
              borderColor={isConfirmed ? color : 'border.muted'}
              borderRadius="xl"
              ml="auto"
              px={2}
              minH="26px"
              color={isConfirmed ? 'white' : 'fg.muted'}
              bg={isConfirmed ? color : 'transparent'}
              flexShrink={0}
              {...(isConfirmed && {
                onClick: () => openManageIssueDrawer({ issue: assumption.issue }),
                cursor: 'pointer',

                _hover: { opacity: 0.85 },
              })}
            >
              {assumption.issue && (
                <>
                  <Icon size={14} color="currentColor" style={{ flexShrink: 0 }} />
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
          <LuCirclePlus
            size={20}
            onClick={() => openManageIssueDrawer()}
            style={{ marginInlineStart: 'auto', cursor: 'pointer' }}
          />
        </>
      )}
    </>
  );
});
