import { Button, Text, VStack } from '@chakra-ui/react';

import { Drawer, DrawerBody, Input, NativeSelect, Textarea } from '@/components/ui';
import { DefaultDrawerProps, Issue, IssueCategory, ResultError } from '@/types';

import { useManageIssue } from './useManageIssue';

interface ManageIssueDrawerProps extends DefaultDrawerProps {
  resultError?: ResultError;
  issue?: Issue;
}

export const ManageIssueDrawer = ({ resultError, issue: initialIssue, closeDrawer }: ManageIssueDrawerProps) => {
  const {
    existingIssues,
    watchedName,
    isFormattingMessage,
    register,
    errors,
    isCreatingAssumption,
    isCreatingIssue,
    isUpdatingIssue,
    isDeletingIssue,
    handleIssueSelected,
    handleCreateAssumption,
    handleUpdateIssue,
    handleFormatMessage,
    openConfirmIssueDeletionDialog,
  } = useManageIssue({ initialIssue, resultError, closeDrawer });

  return (
    <Drawer
      title={`${initialIssue ? 'Edit' : 'Assign'} Issue${resultError ? ` to Result ${resultError.id}` : ''}`}
      onClose={closeDrawer}
    >
      <DrawerBody display="flex" flexDir="column" gap={4}>
        <VStack align="flex-start" gap={0}>
          <Input
            {...register('name')}
            label="Issue Name"
            placeholder="Search for issues..."
            error={errors.name?.message}
          />
          {watchedName && existingIssues.length > 0 && (
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
          {...register('category')}
          label="Category:"
          placeholder="Select Category"
          items={[
            { value: IssueCategory.Bug, label: 'Bug' },
            { value: IssueCategory.Script, label: 'Script' },
            { value: IssueCategory.Infra, label: 'Infra' },
            { value: IssueCategory.Performance, label: 'Performance' },
          ]}
          error={errors.category?.message}
        />
        <Textarea {...register('description')} label="Description:" autoresize error={errors.description?.message} />

        <Button onClick={handleFormatMessage} loading={isFormattingMessage} variant="outline">
          Format message
        </Button>

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
