import { HStack, Text } from '@chakra-ui/react';
import { LuCheck, LuTrash, LuCirclePlus } from 'react-icons/lu';

import { useAssignIssueDrawer } from '@/components/drawers';
import { useConfirmAssumptionMutation } from '@/redux/apis/extendedApi';
import { getIssueCategoryStyle } from '@/utils';
import { ResultError, ResultErrorAssumption } from '@/types';

interface InlineIssueProps {
  resultError: ResultError;
}

export const InlineIssue = ({ resultError }: InlineIssueProps) => {
  const [confirmAssumption] = useConfirmAssumptionMutation();

  const openAssignIssueDrawer = useAssignIssueDrawer({ resultError });

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

          return (
            <HStack key={index} border="1px solid" borderColor={color} borderRadius="md" ml="auto" px={2} color={color}>
              {assumption.issue && (
                <>
                  <Icon size={16} color="currentColor" />
                  <Text color="black">{assumption.issue.name}</Text>
                </>
              )}

              {!assumption.isConfirmed ? (
                <>
                  <Text color="black">{Math.round(assumption.score * 100)}%</Text>
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
              ) : (
                <></>
                //   <button className="edit-issue" onClick={toggleSidebar} />
              )}
            </HStack>
          );
        })
      ) : (
        <>
          <LuCirclePlus
            size={20}
            onClick={openAssignIssueDrawer}
            style={{ marginInlineStart: 'auto', cursor: 'pointer' }}
          />
        </>
      )}
    </>
  );
};
