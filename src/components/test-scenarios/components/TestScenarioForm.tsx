// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button, HStack, Heading, Tabs, Text, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { MarkdownPreview, Textarea, Input } from '@/components/ui';
import { testScenarioAuthoringSchema, type TestScenarioAuthoringFormData } from '@/schemas';

import type { TestScenarioEditableValues } from '../utils';

export type TestScenarioFormMode = 'create' | 'edit';

export interface TestScenarioFormProps {
  mode: TestScenarioFormMode;
  initialValues?: TestScenarioEditableValues;
  isSubmitting?: boolean;
  apiError?: string;
  errorMessage?: string;
  successMessage?: string;
  onSubmit: (values: TestScenarioAuthoringFormData) => void | Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: TestScenarioEditableValues = {
  title: '',
  details: '',
  contentMd: '',
};

export const TestScenarioForm = ({
  mode,
  initialValues = EMPTY_VALUES,
  isSubmitting = false,
  apiError,
  errorMessage,
  successMessage,
  onSubmit,
  onCancel,
}: TestScenarioFormProps) => {
  const [editorMode, setEditorMode] = useState<'source' | 'preview'>('source');
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<TestScenarioAuthoringFormData>({
    resolver: zodResolver(testScenarioAuthoringSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialValues.title,
      details: initialValues.details ?? '',
      contentMd: initialValues.contentMd,
    },
  });

  useEffect(() => {
    reset({
      title: initialValues.title,
      details: initialValues.details ?? '',
      contentMd: initialValues.contentMd,
    });
    setEditorMode('source');
  }, [initialValues.contentMd, initialValues.details, initialValues.title, reset]);

  const contentMd = watch('contentMd');
  const pending = isSubmitting || isFormSubmitting;
  const displayedError = apiError ?? errorMessage;
  const isCreate = mode === 'create';

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      maxW="900px"
      mx={{ base: 4, md: 6 }}
      my={4}
      p={{ base: 4, md: 6 }}
      bg="bg.section"
      borderRadius="12px"
      shadow="sm"
    >
      <VStack align="stretch" gap={6}>
        <VStack align="start" gap={1}>
          <Heading size="lg">{isCreate ? 'Create Test Scenario' : 'Edit Test Scenario'}</Heading>
        </VStack>

        {displayedError && (
          <Alert.Root status="error" role="alert">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Test Scenario save failed</Alert.Title>
              <Alert.Description>{displayedError}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        {successMessage && (
          <Alert.Root status="success" role="status">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{successMessage}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        )}

        <Input {...register('title')} name="title" label="Title" error={errors.title?.message} />

        <Textarea {...register('details')} name="details" label="Details" resize="vertical" />

        <Tabs.Root
          value={editorMode}
          onValueChange={({ value }) => setEditorMode(value === 'preview' ? 'preview' : 'source')}
        >
          <Tabs.List aria-label="Test Scenario editor mode">
            <Tabs.Trigger value="source" type="button">
              Source
            </Tabs.Trigger>
            <Tabs.Trigger value="preview" type="button">
              Preview
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="source" pt={4}>
            <Textarea
              {...register('contentMd')}
              name="contentMd"
              label="Markdown"
              minH="320px"
              resize="vertical"
              fontFamily="mono"
              error={errors.contentMd?.message}
            />
          </Tabs.Content>
          <Tabs.Content value="preview" pt={4} aria-label="Markdown preview">
            {contentMd ? (
              <MarkdownPreview content={contentMd} />
            ) : (
              <Text color="text.muted">Nothing to preview yet.</Text>
            )}
          </Tabs.Content>
        </Tabs.Root>

        <HStack justify="flex-end" gap={3}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={pending} disabled={pending}>
            {isCreate ? 'Create Test Scenario' : 'Save Test Scenario'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export const TestScenarioAuthoringForm = TestScenarioForm;
