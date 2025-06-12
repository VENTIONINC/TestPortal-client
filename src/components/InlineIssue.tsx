import { useState } from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { LuCheck, LuTrash, LuCirclePlus } from 'react-icons/lu';

import {
  useConfirmAssumptionMutation,
  useCreateAssumptionMutation,
  useCreateIssueMutation,
} from '@/redux/apis/extendedApi';
import { Issue } from '@/redux/apis/generatedApi';
import { getIssueCategoryStyle } from '@/utils';
import { ResultError, ResultErrorAssumption } from '@/types';

import { AssignIssueDrawer } from './drawers';

interface InlineIssueProps {
  resultError: ResultError;
}

export const InlineIssue = ({ resultError }: InlineIssueProps) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const [confirmAssumption] = useConfirmAssumptionMutation();
  const [createAssumption] = useCreateAssumptionMutation();
  const [createIssue] = useCreateIssueMutation();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const confirm = async (assumption: ResultErrorAssumption, isConfirmed: boolean) => {
    await confirmAssumption({
      assumptionId: assumption.id.toString(),
      updateAssumptionRequest: { isConfirmed, madeBy: 'user' },
    });
  };

  const handleCreateAssumption = async (issue: Issue) => {
    if (!issue) {
      throw new Error('Unable to create assumption with no linked issue');
    }

    if (!issue.id) {
      issue = await createIssue({ createIssueRequest: issue }).unwrap();
    }

    const assumptionResponse = await createAssumption({
      createAssumptionRequest: {
        madeBy: 'user',
        score: 1,
        isConfirmed: true,
        issueId: issue.id,
        resultErrorId: resultError.id,
      },
    });

    if (assumptionResponse.error) {
      throw new Error(`Cant post new assumption ${assumptionResponse.error}`);
    }

    // TODO: handle assumptionResponse.data
    if (assumptionResponse.data) {
      toggleSidebar();
    } else {
      // eslint-disable-next-line no-console
      console.error('Failed to assign issue');
    }
  };

  return (
    <>
      {resultError.assumptions && resultError.assumptions.length ? (
        resultError.assumptions.map((assumption, index) => {
          if (!assumption) return null;

          const { Icon, color } = getIssueCategoryStyle(assumption.issue.category);

          return (
            <HStack
              key={index}
              border="1px solid"
              borderColor={color}
              borderRadius="md"
              ml="auto"
              px={2}
              color={color}
            >
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
          <LuCirclePlus size={20} onClick={toggleSidebar} style={{ marginInlineStart: 'auto', cursor: 'pointer' }} />
          <AssignIssueDrawer
            open={showSidebar}
            onOpenChange={toggleSidebar}
            title={`Assign Issue to Result ${resultError.id}`}
            onSubmit={handleCreateAssumption}
            lazyMount
          />
        </>
      )}
    </>
  );
};
