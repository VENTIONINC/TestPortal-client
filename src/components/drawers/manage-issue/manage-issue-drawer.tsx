// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text, VStack } from '@chakra-ui/react';

import { Drawer, DrawerBody, Input, NativeSelect, Textarea } from '@/components/ui';
import { DefaultDrawerProps, Issue, IssueCategory, ResultError } from '@/types';
import { ISSUE_CATEGORY_LABELS } from '@/utils';

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
    isFormattingFromResult,
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
    handleFormatFromResult,
    openConfirmIssueDeletionDialog,
  } = useManageIssue({ initialIssue, resultError, closeDrawer });

  return (
    <Drawer
      title={`${initialIssue ? 'Edit' : 'Assign'} Issue${resultError ? ` to Result ${resultError.id}` : ''}`}
      onClose={closeDrawer}
      contentProps={{ bg: 'bg.modal_glass', shadow: 'drawer' }}
      backdropProps={{ bg: 'bg.backdrop' }}
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
            <VStack
              align="stretch"
              w="100%"
              mt={2}
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border.main"
              borderRadius="md"
              maxH="180px"
              overflowY="auto"
            >
              {existingIssues.map((suggestion, index) => (
                <Text
                  key={suggestion.id || index}
                  onClick={() => handleIssueSelected(suggestion)}
                  px={3}
                  py={2}
                  fontWeight={500}
                  color="text.main"
                  borderBottomWidth={index === existingIssues.length - 1 ? 0 : '1px'}
                  borderColor="border.main"
                  cursor="pointer"
                  _hover={{ bg: 'bg.hover' }}
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
          items={Object.values(IssueCategory).map((category) => ({
            value: category,
            label: ISSUE_CATEGORY_LABELS[category],
          }))}
          error={errors.category?.message}
        />
        <Textarea {...register('description')} label="Description:" autoresize error={errors.description?.message} />

        <Button onClick={handleFormatMessage} loading={isFormattingMessage} variant="secondary">
          Format message
        </Button>

        {!initialIssue && resultError && (
          <Button onClick={handleFormatFromResult} loading={isFormattingFromResult} variant="secondary">
            Format from result
          </Button>
        )}

        <Button
          onClick={initialIssue ? handleUpdateIssue : handleCreateAssumption}
          loading={isCreatingAssumption || isCreatingIssue || isUpdatingIssue}
        >
          {initialIssue ? 'Update' : 'Create'}
        </Button>

        {initialIssue && (
          <Button
            onClick={openConfirmIssueDeletionDialog}
            variant="secondaryError"
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
