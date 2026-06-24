// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { HStack, Text } from '@chakra-ui/react';
import { LuCheck, LuTrash, LuCirclePlus } from 'react-icons/lu';

import { useManageIssueDrawer } from '@/components/drawers';
import { useConfirmAssumptionMutation } from '@/redux/apis/extendedApi';
import { getIssueCategoryStyle } from '@/utils';
import { ResultError, ResultErrorAssumption } from '@/types';

interface InlineIssueProps {
  resultError: ResultError;
}

export const InlineIssue = ({ resultError }: InlineIssueProps) => {
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

          const { Icon, color, hoverBgColor } = getIssueCategoryStyle(assumption.issue.category);

          const isConfirmed = assumption.isConfirmed;

          return (
            <HStack
              key={index}
              border="1px solid"
              borderColor={color}
              borderRadius="xl"
              ml="auto"
              px={2}
              minH="26px"
              color={color}
              {...(isConfirmed && {
                onClick: () => openManageIssueDrawer({ issue: assumption.issue }),
                cursor: 'pointer',

                _hover: { bg: hoverBgColor, color: 'text.mainHover' },
              })}
            >
              {assumption.issue && (
                <>
                  <Icon size={16} color="currentColor" />
                  <Text fontSize="xs">{assumption.issue.name}</Text>
                </>
              )}

              {!isConfirmed && (
                <>
                  <Text color="text.main" fontSize="xs">
                    {Math.round(assumption.score * 100)}%
                  </Text>
                  <LuCheck
                    color="green"
                    size={16}
                    onClick={() => confirm(assumption, true)}
                    style={{ cursor: 'pointer' }}
                  />
                  <LuTrash
                    color="red"
                    size={16}
                    onClick={() => confirm(assumption, false)}
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
};
