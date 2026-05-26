// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useConfirmIssueDeletionDialog } from '@/components/ui/components/Dialogs';
import { useCreateAssumptionMutation } from '@/redux/apis/extendedApi';
import {
  useDeleteApiV2IssuesByIssueIdMutation,
  usePatchApiV2IssuesByIssueIdMutation,
  usePostApiV2ErrorFormatterMutation,
  usePostApiV2ErrorFormatterResultMutation,
  usePostApiV2IssuesMutation,
} from '@/redux/apis/generatedApi';
import { useLazyGetIssuesQuery } from '@/redux/apis/issuesApi';
import { Issue, IssueCategory, ResultError } from '@/types';
import { formatMessageSchema, FormatMessageFormData } from '@/schemas';
import { toaster } from '@/components/ui';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { serializeAnalysisCategoryToIssueCategory } from '@/utils';

interface UseManageIssueProps {
  initialIssue?: Issue;
  resultError?: ResultError;
  closeDrawer: () => void;
}

export const useManageIssue = ({ initialIssue, resultError, closeDrawer }: UseManageIssueProps) => {
  const selectedProjectId = useSelectedProjectId();
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

  // React Hook Form for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormatMessageFormData>({
    resolver: zodResolver(formatMessageSchema),
    defaultValues: {
      name: issue.name,
      description: issue.description,
      category: issue.category,
    },
  });

  const watchedName = watch('name');

  // API hooks
  const [getIssues] = useLazyGetIssuesQuery();
  const [createAssumption, { isLoading: isCreatingAssumption }] = useCreateAssumptionMutation();
  const [createIssue, { isLoading: isCreatingIssue }] = usePostApiV2IssuesMutation();
  const [updateIssue, { isLoading: isUpdatingIssue }] = usePatchApiV2IssuesByIssueIdMutation();
  const [deleteIssue, { isLoading: isDeletingIssue }] = useDeleteApiV2IssuesByIssueIdMutation();
  const [formatError, { isLoading: isFormattingError }] = usePostApiV2ErrorFormatterMutation();
  const [formatFromResult, { isLoading: isFormattingFromResult }] = usePostApiV2ErrorFormatterResultMutation();

  // Load existing issues for search
  const loadIssues = useCallback(async () => {
    if (!watchedName?.trim()) return;

    try {
      const res = await getIssues({
        name: watchedName,
        category: issue.category,
        projectId: selectedProjectId,
      }).unwrap();
      setExistingIssues(res.issues);
    } catch {
      toaster.create({ title: 'Failed to load issues', type: 'error' });
    }
  }, [getIssues, issue.category, watchedName, selectedProjectId]);

  // Handle issue selection from search results
  const handleIssueSelected = (selectedIssue: Issue) => {
    setIssue(selectedIssue);
    setValue('name', selectedIssue.name);
    setValue('description', selectedIssue.description);
    setValue('category', selectedIssue.category);
  };

  // Create assumption
  const handleCreateAssumption = handleSubmit(async (formData) => {
    const issueToCreate = {
      ...issue,
      projectId: selectedProjectId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
    };

    const issueId = issue.id ?? (await createIssue({ createIssueRequest: issueToCreate }).unwrap()).id;
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

    if (assumptionResponse.data) {
      closeDrawer();
    } else {
      toaster.create({ title: 'Failed to assign issue', type: 'error' });
    }
  });

  // Update issue
  const handleUpdateIssue = handleSubmit(async (formData) => {
    const res = await updateIssue({
      issueId: issue.id,
      updateIssueRequest: {
        name: formData.name,
        category: formData.category,
        description: formData.description,
      },
    });

    if (res.error) {
      return toaster.create({ title: 'Failed to update issue', type: 'error' });
    }

    closeDrawer();
  });

  // Delete issue
  const handleDeleteIssue = async () => {
    try {
      await deleteIssue({ issueId: issue.id, projectId: selectedProjectId }).unwrap();
      toaster.create({ title: 'Issue deleted successfully', type: 'success' });
      closeDrawer();
    } catch {
      toaster.create({ title: 'Failed to delete issue', type: 'error' });
    }
  };

  // Format message
  const handleFormatMessage = handleSubmit(async (formData) => {
    try {
      const result = await formatError({
        errorFormatterRequest: {
          name: formData.name,
          description: formData.description,
          category: formData.category,
        },
      }).unwrap();

      // Parse the formatted response - the API returns formatted name and description
      setValue('name', result.formatted.name);
      setValue('description', result.formatted.description);

      // Update issue state for other operations
      setIssue({
        ...issue,
        name: result.formatted.name,
        description: result.formatted.description,
      });

      toaster.create({ title: 'Message formatted successfully', type: 'success' });
    } catch {
      toaster.create({ title: 'Failed to format message', type: 'error' });
    }
  });

  // Format from result
  const handleFormatFromResult = async () => {
    // Safety check: only available in Create mode with resultError
    if (!resultError?.id) {
      toaster.create({ title: 'No result error available', type: 'error' });
      return;
    }

    try {
      const result = await formatFromResult({
        errorSuggestionRequest: {
          resultId: resultError.resultId,
          projectId: selectedProjectId,
        },
      }).unwrap();
      const category = serializeAnalysisCategoryToIssueCategory(result.category);
      const description = result.description;

      if (!category) {
        toaster.create({ title: 'Failed to map analysis category to issue category', type: 'error' });
        return;
      }

      // The API returns { category, description } (no name field)
      setValue('category', category);
      setValue('description', description);

      // Update issue state for other operations
      setIssue({
        ...issue,
        category: category,
        description: description,
      });

      toaster.create({ title: 'Suggestion applied successfully', type: 'success' });
    } catch {
      toaster.create({ title: 'Failed to get suggestion from result', type: 'error' });
    }
  };

  const openConfirmIssueDeletionDialog = useConfirmIssueDeletionDialog({ onConfirm: handleDeleteIssue });

  // Load issues on name change
  useEffect(() => {
    const timeoutId = setTimeout(loadIssues, 300);
    return () => clearTimeout(timeoutId);
  }, [loadIssues]);

  return {
    // State
    issue,
    existingIssues,
    watchedName,
    isFormattingMessage: isFormattingError,
    isFormattingFromResult,

    // Form
    register,
    errors,

    // Loading states
    isCreatingAssumption,
    isCreatingIssue,
    isUpdatingIssue,
    isDeletingIssue,

    // Handlers
    handleIssueSelected,
    handleCreateAssumption,
    handleUpdateIssue,
    handleFormatMessage,
    handleFormatFromResult,
    openConfirmIssueDeletionDialog,
  };
};
