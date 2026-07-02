// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text, VStack } from '@chakra-ui/react';

import { Alert, Drawer, DrawerBody, Input, NativeSelect, Textarea } from '@/components/ui';
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
    isFormatting,
    generatedSuggestionSource,
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
        <Textarea
          {...register('description')}
          label="Description:"
          autoresize
          minH="96px"
          maxH="180px"
          overflowY="auto"
          disabled={isFormatting}
          error={errors.description?.message}
        />

        {(isFormatting || generatedSuggestionSource) && (
          <Alert.Root status={isFormatting ? 'warning' : 'info'}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontSize="xs" fontWeight="bold">
                {isFormatting ? 'AI formatting in progress' : 'AI-generated suggestion'}
              </Alert.Title>
              <Alert.Description fontSize="xs">
                {isFormatting
                  ? 'Generated text is being prepared. Review it before creating the issue.'
                  : `Generated from ${generatedSuggestionSource === 'result' ? 'the result' : 'your message'}. Review or edit before creating the issue.`}
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <Button
          onClick={handleFormatMessage}
          loading={isFormattingMessage}
          disabled={isFormattingFromResult}
          variant="secondary"
        >
          {isFormattingMessage ? 'Formatting...' : 'Format message'}
        </Button>

        {!initialIssue && resultError && (
          <Button
            onClick={handleFormatFromResult}
            loading={isFormattingFromResult}
            disabled={isFormattingMessage}
            variant="secondary"
          >
            {isFormattingFromResult ? 'Formatting...' : 'Format from result'}
          </Button>
        )}

        <Button
          onClick={initialIssue ? handleUpdateIssue : handleCreateAssumption}
          loading={isCreatingAssumption || isCreatingIssue || isUpdatingIssue}
          disabled={isFormatting}
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
