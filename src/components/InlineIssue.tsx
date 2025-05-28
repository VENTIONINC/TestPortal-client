import { useState } from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { LuCheck, LuCirclePlus, LuTrash } from 'react-icons/lu';

import { useConfirmAssumptionMutation, useCreateAssumptionMutation } from '@/redux/apis/assumptionsApi';
import { Issue, ResultError, ResultErrorAssumption } from '@/types';

import { AssignIssueDrawer } from './drawers';

interface InlineIssueProps {
  resultError: ResultError;
}

export const InlineIssue = ({ resultError }: InlineIssueProps) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const [confirmAssumption] = useConfirmAssumptionMutation();
  const [createAssumption] = useCreateAssumptionMutation();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const confirm = async (assumption: ResultErrorAssumption, isConfirmed: boolean) => {
    await confirmAssumption({ id: assumption.id, isConfirmed, madeBy: 'user' });
  };

  const handleCreateAssumption = async (issue: Issue) => {
    if (!issue) {
      throw new Error('Unable to create assumption with no linked issue');
    }

    if (!issue.id) {
      const issueResponse = await fetch(`http://localhost:3001/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
      });

      if (!issueResponse.ok) {
        throw new Error(`Cant post new issue ${issueResponse.status}`);
      }

      issue = await issueResponse.json();
    }

    const assumptionResponse = await createAssumption({
      madeBy: 'user',
      score: 1,
      isConfirmed: true,
      issueId: issue.id,
      resultErrorId: resultError.id,
    });

    if (assumptionResponse.error) {
      throw new Error(`Cant post new assumption ${assumptionResponse.error}`);
    }

    // TODO: handle assumptionResponse.data
    if (assumptionResponse.data) {
      toggleSidebar();
    } else {
      console.error('Failed to assign issue');
    }
  };

  return (
    <>
      {resultError.assumptions && resultError.assumptions.length ? (
        resultError.assumptions.map((assumption, index) => (
          <HStack key={index} border="1px dashed" borderColor="green.500" borderRadius="md" ml="auto" px={2}>
            {assumption && assumption.issue && <Text textStyle="sm">{assumption.issue.name}</Text>}

            {assumption && !assumption.isConfirmed ? (
              <>
                <Text>{Math.round(assumption.score * 100)}%</Text>
                <LuCheck
                  color="green"
                  size={24}
                  onClick={() => confirm(assumption, true)}
                  style={{ cursor: 'pointer' }}
                />
                <LuTrash
                  color="red"
                  size={24}
                  onClick={() => confirm(assumption, false)}
                  style={{ cursor: 'pointer' }}
                />
              </>
            ) : (
              <></>
              //   <button className="edit-issue" onClick={toggleSidebar} />
            )}
          </HStack>
        ))
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
