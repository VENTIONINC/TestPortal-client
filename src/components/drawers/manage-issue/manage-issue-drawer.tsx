import { useState, useEffect, useCallback } from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';

import { Drawer, DrawerBody, Input, NativeSelect, Textarea, toaster } from '@/components/ui';
import { useConfirmIssueDeletionDialog } from '@/components/dialogs';
import { useCreateAssumptionMutation } from '@/redux/apis/extendedApi';
import {
  useDeleteApiV1IssuesByIssueIdMutation,
  usePatchApiV1IssuesByIssueIdMutation,
  usePostApiV1IssuesMutation,
} from '@/redux/apis/generatedApi';
import { useLazyGetIssuesQuery } from '@/redux/apis/issuesApi';
import { DefaultDrawerProps, Issue, IssueCategory, ResultError } from '@/types';

interface ManageIssueDrawerProps extends DefaultDrawerProps {
  resultError?: ResultError;
  issue?: Issue;
}

export const ManageIssueDrawer = ({ resultError, issue: initialIssue, closeDrawer }: ManageIssueDrawerProps) => {
  const [issue, setIssue] = useState<Issue>(
    initialIssue ??
      ({
        name: '',
        category: '' as IssueCategory,
        description: '',
        portal: '',
        service: '',
        ticket: '',
      } as Issue),
  );
  const [existingIssues, setExistingIssues] = useState<Issue[]>([]);

  const [getIssues] = useLazyGetIssuesQuery();
  const [createAssumption, { isLoading: isCreatingAssumption }] = useCreateAssumptionMutation();
  const [createIssue, { isLoading: isCreatingIssue }] = usePostApiV1IssuesMutation();
  const [updateIssue, { isLoading: isUpdatingIssue }] = usePatchApiV1IssuesByIssueIdMutation();
  const [deleteIssue, { isLoading: isDeletingIssue }] = useDeleteApiV1IssuesByIssueIdMutation();

  const loadIssues = useCallback(async () => {
    if (!issue.name.trim()) return;

    try {
      const res = await getIssues({ name: issue.name, category: issue.category }).unwrap();
      setExistingIssues(res.issues);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load issues:', error);
    }
  }, [getIssues, issue.category, issue.name]);

  const handleIssueNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssue({ ...issue, name: e.target.value });
  };

  const handleIssueSelected = (selectedIssue: Issue) => {
    setIssue(selectedIssue);
  };

  const handleCreateAssumption = async () => {
    const issueId = issue.id ?? (await createIssue({ createIssueRequest: issue }).unwrap()).id;
    if (!issueId) return toaster.create({ title: 'Unable to create assumption with no linked issue', type: 'error' });
    if (!resultError)
      return toaster.create({ title: 'Unable to create assumption with no result error', type: 'error' });

    const assumptionResponse = await createAssumption({
      createAssumptionRequest: {
        madeBy: 'user',
        score: 1,
        isConfirmed: true,
        issueId,
        resultErrorId: resultError.id,
      },
    });

    if (assumptionResponse.error) {
      throw new Error(`Cant post new assumption ${assumptionResponse.error}`);
    }

    // TODO: handle assumptionResponse.data
    if (assumptionResponse.data) {
      closeDrawer();
    } else {
      // eslint-disable-next-line no-console
      console.error('Failed to assign issue');
    }
  };

  const handleUpdateIssue = async () => {
    const res = await updateIssue({
      issueId: issue.id,
      updateIssueRequest: { name: issue.name, category: issue.category, description: issue.description },
    });

    if (res.error) {
      return toaster.create({ title: 'Failed to update issue', type: 'error' });
    }

    closeDrawer();
  };

  const handleDeleteIssue = async () => {
    try {
      await deleteIssue({ issueId: issue.id }).unwrap();

      toaster.create({ title: 'Issue deleted successfully', type: 'success' });
      closeDrawer();
    } catch {
      toaster.create({ title: 'Failed to delete issue', type: 'error' });
    }
  };

  const openConfirmIssueDeletionDialog = useConfirmIssueDeletionDialog({ onConfirm: handleDeleteIssue });

  useEffect(() => {
    const timeoutId = setTimeout(loadIssues, 300);

    return () => clearTimeout(timeoutId);
  }, [loadIssues]);

  return (
    <Drawer
      title={`${initialIssue ? 'Edit' : 'Assign'} Issue${resultError ? ` to Result ${resultError.id}` : ''}`}
      onClose={closeDrawer}
    >
      <DrawerBody display="flex" flexDir="column" gap={4}>
        <VStack align="flex-start" gap={0}>
          <Input
            label="Issue Name"
            name="name"
            placeholder="Search for issues..."
            value={issue.name}
            onChange={handleIssueNameChange}
          />
          {issue.name && existingIssues.length > 0 && (
            <VStack align="stretch" bg="gray.100" borderRadius="sm">
              {existingIssues.map((suggestion, index) => (
                <Text
                  key={suggestion.id || index}
                  onClick={() => handleIssueSelected(suggestion)}
                  px={2}
                  fontWeight={600}
                  cursor="pointer"
                  _hover={{ bg: 'gray.200' }}
                >
                  {suggestion.name}
                </Text>
              ))}
            </VStack>
          )}
        </VStack>

        <NativeSelect
          label="Category:"
          name="category"
          placeholder="Select Category"
          value={issue.category}
          onChange={(e) => setIssue({ ...issue, category: e.target.value as IssueCategory })}
          items={[
            { value: IssueCategory.Bug, label: 'Bug' },
            { value: IssueCategory.Script, label: 'Script' },
            { value: IssueCategory.Infra, label: 'Infra' },
            { value: IssueCategory.Performance, label: 'Performance' },
          ]}
        />
        <Textarea
          label="Description:"
          name="description"
          value={issue.description}
          onChange={(e) => setIssue({ ...issue, description: e.target.value })}
          autoresize
        />

        <Button
          onClick={initialIssue ? handleUpdateIssue : handleCreateAssumption}
          loading={isCreatingAssumption || isCreatingIssue || isUpdatingIssue}
        >
          {initialIssue ? 'Update' : 'Create'}
        </Button>

        {initialIssue && (
          <Button
            onClick={openConfirmIssueDeletionDialog}
            bg="red.500"
            mt="auto"
            loading={isDeletingIssue}
            disabled={isDeletingIssue}
          >
            Delete
          </Button>
        )}
      </DrawerBody>
    </Drawer>
  );
};
