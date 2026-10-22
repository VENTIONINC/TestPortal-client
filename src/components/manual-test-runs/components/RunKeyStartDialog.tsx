// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Grid, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { Dialog, DialogBody, DialogFooter, Input, NativeSelect } from '@/components/ui';
import {
  useDeleteApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation,
  useGetApiV2ProjectsByProjectIdManualRunEnvironmentProfilesQuery,
  usePatchApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation,
  usePostApiV2ProjectsByProjectIdManualRunEnvironmentProfilesMutation,
} from '@/redux/apis/extendedApi';
import type { ManualRunEnvironmentProfile, ManualTestRunStartRequest } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';
import { createReadableLabelSchema } from '@/schemas';

export type ManualTestRunStartValues = {
  runKey?: string;
  environment: Pick<
    ManualTestRunStartRequest,
    'environmentProfileId' | 'browser' | 'operatingSystem' | 'device' | 'apiEnvironment' | 'build' | 'deployment'
  >;
};

interface EnvironmentDraft {
  browser: string;
  operatingSystem: string;
  device: string;
  apiEnvironment: string;
  build: string;
  deployment: string;
}

const EMPTY_ENVIRONMENT: EnvironmentDraft = {
  browser: '',
  operatingSystem: '',
  device: '',
  apiEnvironment: '',
  build: '',
  deployment: '',
};

const RUN_FIELDS = ['browser', 'operatingSystem', 'device', 'apiEnvironment', 'build', 'deployment'] as const;

const valueOrNull = (value: string) => value.trim() || null;
const errorMessage = (error: unknown) => extractApiError(error as FetchBaseQueryError);
const getProfileLabel = (profile: ManualRunEnvironmentProfile) => {
  const summary = [profile.browser, profile.operatingSystem, profile.device, profile.apiEnvironment]
    .filter(Boolean)
    .join(' · ');
  return summary ? `${profile.name} — ${summary}` : profile.name;
};

export interface RunKeyStartDialogProps {
  projectId: string;
  isOpen: boolean;
  context: 'start' | 'retest';
  scenarioStepCount?: number;
  value: string;
  error?: string;
  isUncertain?: boolean;
  isRetryConfirmationRequired?: boolean;
  isSubmitting?: boolean;
  onValueChange: (value: string) => void;
  onCancel: () => void;
  onRequireRetryConfirmation: () => void;
  onSubmit: (values: ManualTestRunStartValues) => void;
}

export const RunKeyStartDialog = ({
  projectId,
  isOpen,
  context,
  scenarioStepCount,
  value,
  error,
  isUncertain = false,
  isRetryConfirmationRequired = false,
  isSubmitting = false,
  onValueChange,
  onCancel,
  onRequireRetryConfirmation,
  onSubmit,
}: RunKeyStartDialogProps) => {
  const [validationError, setValidationError] = useState<string>();
  const [isEnvironmentOpen, setIsEnvironmentOpen] = useState(false);
  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false);
  const [environment, setEnvironment] = useState<EnvironmentDraft>(EMPTY_ENVIRONMENT);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string }>();
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const profilesQuery = useGetApiV2ProjectsByProjectIdManualRunEnvironmentProfilesQuery(
    { projectId },
    { skip: !isOpen || !projectId },
  );
  const [createProfile, createState] = usePostApiV2ProjectsByProjectIdManualRunEnvironmentProfilesMutation();
  const [updateProfile, updateState] =
    usePatchApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation();
  const [deleteProfile, deleteState] =
    useDeleteApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation();
  const isProfileSaving = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!isOpen) return;
    setValidationError(undefined);
    setIsEnvironmentOpen(false);
    setIsProfileActionsOpen(false);
    setEnvironment(EMPTY_ENVIRONMENT);
    setSelectedProfileId('');
    setProfileName('');
    setProfileFeedback(undefined);
    setIsDeleteConfirmationOpen(false);
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const updateEnvironment = (field: keyof EnvironmentDraft, nextValue: string) => {
    setEnvironment((current) => ({ ...current, [field]: nextValue }));
    setProfileFeedback(undefined);
  };

  const applyProfile = (profile?: ManualRunEnvironmentProfile) => {
    setSelectedProfileId(profile?.id ?? '');
    setProfileName(profile?.name ?? '');
    if (profile) {
      setEnvironment((current) => ({
        ...current,
        browser: profile.browser ?? '',
        operatingSystem: profile.operatingSystem ?? '',
        device: profile.device ?? '',
        apiEnvironment: profile.apiEnvironment ?? '',
      }));
    }
    setProfileFeedback(undefined);
    setIsDeleteConfirmationOpen(false);
  };

  const getProfileInput = () => ({
    browser: valueOrNull(environment.browser),
    operatingSystem: valueOrNull(environment.operatingSystem),
    device: valueOrNull(environment.device),
    apiEnvironment: valueOrNull(environment.apiEnvironment),
  });

  const saveProfile = async (mode: 'create' | 'update') => {
    const parsedName = createReadableLabelSchema('Profile name').safeParse(profileName);
    if (!parsedName.success || !parsedName.data) {
      setProfileFeedback({
        type: 'error',
        text: parsedName.success
          ? 'Profile name is required.'
          : (parsedName.error.issues[0]?.message ?? 'Enter a valid profile name.'),
      });
      return;
    }

    setProfileFeedback(undefined);
    try {
      const body = { name: parsedName.data, ...getProfileInput() };
      if (mode === 'create') {
        const profile = await createProfile({ projectId, manualRunEnvironmentProfileCreateRequest: body }).unwrap();
        applyProfile(profile);
        setProfileFeedback({ type: 'success', text: 'Environment profile saved.' });
      } else {
        if (!selectedProfileId) return;
        const profile = await updateProfile({
          projectId,
          profileId: selectedProfileId,
          manualRunEnvironmentProfileUpdateRequest: body,
        }).unwrap();
        applyProfile(profile);
        setProfileFeedback({ type: 'success', text: 'Environment profile updated.' });
      }
    } catch (saveError) {
      setProfileFeedback({ type: 'error', text: errorMessage(saveError) });
    }
  };

  const confirmDeleteProfile = async () => {
    if (!selectedProfileId) return;
    setProfileFeedback(undefined);
    try {
      await deleteProfile({ projectId, profileId: selectedProfileId }).unwrap();
      applyProfile(undefined);
      setProfileFeedback({ type: 'success', text: 'Environment profile deleted.' });
    } catch (deleteError) {
      setProfileFeedback({ type: 'error', text: errorMessage(deleteError) });
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = createReadableLabelSchema('Run key').safeParse(value);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Enter a valid Run key.');
      return;
    }

    setValidationError(undefined);
    if (isUncertain && !isRetryConfirmationRequired) {
      onRequireRetryConfirmation();
      return;
    }

    const environmentValues = RUN_FIELDS.reduce<ManualTestRunStartValues['environment']>((values, field) => {
      const fieldValue = valueOrNull(environment[field]);
      if (selectedProfileId || fieldValue) values[field] = fieldValue;
      return values;
    }, {});
    if (selectedProfileId) environmentValues.environmentProfileId = selectedProfileId;
    onSubmit({ runKey: result.data || undefined, environment: environmentValues });
  };

  const fields = [
    { name: 'browser', label: 'Browser', summaryLabel: 'Browser', placeholder: 'e.g. Chrome 129' },
    { name: 'operatingSystem', label: 'OS', summaryLabel: 'OS', placeholder: 'e.g. macOS 15' },
    { name: 'device', label: 'Device', summaryLabel: 'Device', placeholder: 'e.g. Desktop or iPhone 16' },
    { name: 'apiEnvironment', label: 'API environment', summaryLabel: 'API', placeholder: 'e.g. Staging' },
    { name: 'build', label: 'Build', summaryLabel: 'Build', placeholder: 'e.g. 2026.10.09 or commit SHA' },
    { name: 'deployment', label: 'Deployment', summaryLabel: 'Deployment', placeholder: 'e.g. staging-eu or deployment URL' },
  ] as const;
  const environmentSummary = fields
    .filter(({ name }) => environment[name].trim())
    .map(({ name, summaryLabel }) => ({ label: summaryLabel, value: environment[name].trim() }));
  const selectedProfileName = profilesQuery.data?.find((profile) => profile.id === selectedProfileId)?.name;
  const environmentSummaryItems = selectedProfileName
    ? [{ label: 'Profile', value: selectedProfileName }, ...environmentSummary]
    : environmentSummary;

  return (
    <Dialog
      title="Start manual run"
      onClose={onCancel}
      contentProps={{ maxW: '2xl', w: 'full', maxH: 'calc(100dvh - 2rem)', display: 'flex', flexDir: 'column', overflow: 'hidden' }}
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <DialogBody display="flex" flex="1" flexDir="column" gap={5} minH={0} overflowY="auto">
          <Text color="text.secondary">
            {context === 'retest'
              ? 'This starts a new run using the current saved scenario content and steps. It does not change this historical run.'
              : `Start a new run from the current saved scenario snapshot${scenarioStepCount === undefined ? '' : `, including ${scenarioStepCount} ${scenarioStepCount === 1 ? 'step' : 'steps'}`}. Later changes to the scenario will not affect this run.`}
          </Text>
          {error && (
            <Alert.Root status={isUncertain ? 'warning' : 'error'} role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{isUncertain ? 'Start result is uncertain' : 'Run was not started'}</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          {isRetryConfirmationRequired && (
            <Alert.Root status="warning" role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Confirm another start</Alert.Title>
                <Alert.Description>
                  The earlier request may have created a run. Inspect run history before continuing; starting again
                  could create a duplicate.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          <Input
            autoFocus
            name="runKey"
            label="Run key (optional)"
            placeholder="e.g. RUN-1"
            value={value}
            onChange={(event) => {
              onValueChange(event.target.value);
              setValidationError(undefined);
            }}
            fieldProps={{ helperText: 'Up to 100 characters. Duplicate keys are allowed.' }}
            error={validationError}
          />
          <Box as="section" borderTopWidth="1px" borderColor="border.subtle" pt={3}>
            <Button
              type="button"
              variant="plain"
              w="full"
              justifyContent="flex-start"
              px={0}
              py={2}
              aria-expanded={isEnvironmentOpen}
              aria-controls="manual-run-environment-fields"
              onClick={() => setIsEnvironmentOpen((open) => !open)}
            >
              <HStack minW={0} maxW="full" gap={3} textAlign="start">
                <Text flexShrink={0} fontWeight={500}>Environment</Text>
                {!isEnvironmentOpen && !environmentSummaryItems.length ? (
                  <Text color="text.secondary" fontSize="sm" fontWeight={400}>Optional</Text>
                ) : null}
              </HStack>
              {isEnvironmentOpen ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
            </Button>
            {!isEnvironmentOpen && environmentSummaryItems.length > 0 && (
              <Box
                mt={2}
                p={3}
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="md"
                bg="bg.subtle"
              >
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
                  {environmentSummaryItems.map(({ label, value: summaryValue }) => (
                    <Box key={label} minW={0}>
                      <Text color="text.secondary" fontSize="xs" mb={0.5}>{label}</Text>
                      <Text color="text.main" fontSize="sm" overflowWrap="anywhere">
                        {summaryValue}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}
            {isEnvironmentOpen && (
              <VStack id="manual-run-environment-fields" align="stretch" gap={4} mt={3}>
                {profilesQuery.isLoading && <Text role="status">Loading environment profiles…</Text>}
                {profilesQuery.isError && (
                  <Alert.Root status="error" role="alert">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Could not load environment profiles.</Alert.Title>
                      <Alert.Description>
                        <Button type="button" variant="plain" onClick={() => void profilesQuery.refetch()}>
                          Retry
                        </Button>
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
                <NativeSelect
                  name="environmentProfile"
                  label="Saved profile (optional)"
                  value={selectedProfileId}
                  onChange={(event) => {
                    const profile = profilesQuery.data?.find((candidate) => candidate.id === event.target.value);
                    applyProfile(profile);
                  }}
                  items={[
                    { value: '', label: 'Enter values manually' },
                    ...(profilesQuery.data ?? []).map((profile) => ({
                      value: profile.id,
                      label: getProfileLabel(profile),
                    })),
                  ]}
                  disabled={profilesQuery.isLoading || profilesQuery.isError || deleteState.isLoading}
                />
                {selectedProfileId && (
                  <Text color="text.secondary" fontSize="sm" mt={-2}>
                    Changes here apply to this run. The saved profile stays unchanged unless you update it below.
                  </Text>
                )}
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
                  {fields.slice(0, 3).map((field) => (
                    <Input
                      key={field.name}
                      name={`environment-${field.name}`}
                      label={field.label}
                      placeholder={field.placeholder}
                      maxLength={200}
                      value={environment[field.name]}
                      onChange={(event) => updateEnvironment(field.name, event.target.value)}
                    />
                  ))}
                </Grid>
                <Box borderTopWidth="1px" borderColor="border.subtle" pt={3}>
                  <Text color="text.secondary" fontSize="sm" fontWeight={500} mb={3}>
                    Release context
                  </Text>
                  <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
                    {fields.slice(3).map((field) => (
                      <Input
                        key={field.name}
                        name={`environment-${field.name}`}
                        label={field.label}
                        placeholder={field.placeholder}
                        maxLength={200}
                        value={environment[field.name]}
                        onChange={(event) => updateEnvironment(field.name, event.target.value)}
                      />
                    ))}
                  </Grid>
                </Box>
                <Box borderTopWidth="1px" borderColor="border.subtle" pt={3}>
                  <Button
                    type="button"
                    variant="plain"
                    size="sm"
                    px={0}
                    aria-expanded={isProfileActionsOpen}
                    aria-controls="manual-run-profile-actions"
                    onClick={() => setIsProfileActionsOpen((open) => !open)}
                  >
                    {isProfileActionsOpen ? 'Hide profile actions' : selectedProfileId ? 'Manage profile' : 'Save as profile'}
                    {isProfileActionsOpen ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                  </Button>
                  {isProfileActionsOpen && (
                    <VStack id="manual-run-profile-actions" align="stretch" gap={3} mt={3}>
                      <Heading size="sm">Profile actions</Heading>
                      <VStack align="stretch" gap={3}>
                        <Input
                          name="environment-profile-name"
                          label="Profile name"
                          placeholder="e.g. Chrome on staging"
                          maxLength={100}
                          value={profileName}
                          onChange={(event) => {
                            setProfileName(event.target.value);
                            setProfileFeedback(undefined);
                          }}
                          fieldProps={{ helperText: 'Saved profiles are private to you and this project.' }}
                        />
                        <HStack flexWrap="wrap" gap={2}>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void saveProfile('create')}
                            loading={createState.isLoading}
                            disabled={isProfileSaving || deleteState.isLoading}
                          >
                            Save as new profile
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void saveProfile('update')}
                            loading={updateState.isLoading}
                            disabled={!selectedProfileId || isProfileSaving || deleteState.isLoading}
                          >
                            Update selected profile
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsDeleteConfirmationOpen(true)}
                            disabled={!selectedProfileId || isProfileSaving || deleteState.isLoading}
                          >
                            Delete selected profile
                          </Button>
                        </HStack>
                        {isDeleteConfirmationOpen && (
                          <Alert.Root status="warning" role="alert">
                            <Alert.Indicator />
                            <Alert.Content>
                              <Alert.Title>Delete this profile?</Alert.Title>
                              <Alert.Description>Saved runs keep their environment values.</Alert.Description>
                              <HStack mt={2}>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsDeleteConfirmationOpen(false)}
                                  disabled={deleteState.isLoading}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  colorPalette="red"
                                  onClick={() => void confirmDeleteProfile()}
                                  loading={deleteState.isLoading}
                                >
                                  Delete profile
                                </Button>
                              </HStack>
                            </Alert.Content>
                          </Alert.Root>
                        )}
                        {profileFeedback && (
                          <Alert.Root
                            status={profileFeedback.type}
                            role={profileFeedback.type === 'error' ? 'alert' : 'status'}
                          >
                            <Alert.Indicator />
                            <Alert.Content>
                              <Alert.Description>{profileFeedback.text}</Alert.Description>
                            </Alert.Content>
                          </Alert.Root>
                        )}
                      </VStack>
                    </VStack>
                  )}
                </Box>
              </VStack>
            )}
          </Box>
        </DialogBody>
        <DialogFooter flexShrink={0}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isRetryConfirmationRequired ? 'Start another run' : 'Start run'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
