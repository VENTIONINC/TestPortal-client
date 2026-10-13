// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RunKeyStartDialog } from '@/components/manual-test-runs/components/RunKeyStartDialog';
import { ChakraProvider } from '@/components/ui';

const profileApi = vi.hoisted(() => ({
  profiles: [] as Array<{ id: string; projectId: string; ownerId: string; name: string; browser: string | null; operatingSystem: string | null; device: string | null; apiEnvironment: string | null; createdAt: string; updatedAt: string }>,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  return {
    ...actual,
    useGetApiV2ProjectsByProjectIdManualRunEnvironmentProfilesQuery: vi.fn(() => ({ data: profileApi.profiles, isLoading: false, isError: false, refetch: profileApi.refetch })),
    usePostApiV2ProjectsByProjectIdManualRunEnvironmentProfilesMutation: vi.fn(() => [profileApi.create, { isLoading: false }]),
    usePatchApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation: vi.fn(() => [profileApi.update, { isLoading: false }]),
    useDeleteApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation: vi.fn(() => [profileApi.remove, { isLoading: false }]),
  };
});

const renderDialog = (props: Partial<React.ComponentProps<typeof RunKeyStartDialog>> = {}) => {
  const onCancel = vi.fn();
  const onSubmit = vi.fn();
  const onValueChange = vi.fn();
  const onRequireRetryConfirmation = vi.fn();
  const view = render(
    <ChakraProvider>
      <RunKeyStartDialog
        projectId="project-1"
        isOpen
        context="start"
        value=""
        onValueChange={onValueChange}
        onCancel={onCancel}
        onRequireRetryConfirmation={onRequireRetryConfirmation}
        onSubmit={onSubmit}
        {...props}
      />
    </ChakraProvider>,
  );

  return { ...view, onCancel, onSubmit, onValueChange, onRequireRetryConfirmation };
};

describe('RunKeyStartDialog', () => {
  beforeEach(() => {
    profileApi.profiles = [];
    profileApi.create.mockReset();
    profileApi.update.mockReset();
    profileApi.remove.mockReset();
    profileApi.refetch.mockReset();
  });

  it('opens with an empty optional key input and shows Retest context', () => {
    renderDialog({ context: 'retest' });

    const input = screen.getByRole('textbox', { name: 'Run key (optional)' });
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'e.g. RUN-1');
    expect(screen.getByText('Up to 100 characters. Duplicate keys are allowed.')).toBeInTheDocument();
    expect(screen.getByText(/current saved scenario content and steps/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start run' })).toBeInTheDocument();
  });

  it('trims a valid key, omits blank input and blocks invalid values', async () => {
    const user = userEvent.setup();
    const { onSubmit, unmount } = renderDialog({ value: '  RUN-1  ' });
    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(onSubmit).toHaveBeenCalledWith({ runKey: 'RUN-1', environment: {} });
    unmount();

    const invalid = renderDialog({ value: 'RUN\n1' });
    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(screen.getByText('Run key must be a single line')).toBeInTheDocument();
    expect(invalid.onSubmit).not.toHaveBeenCalled();
    expect(invalid.onRequireRetryConfirmation).not.toHaveBeenCalled();
  });

  it('submits no key for whitespace-only input', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog({ value: '  \t ' });

    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(onSubmit).toHaveBeenCalledWith({ runKey: undefined, environment: {} });
  });

  it('applies a saved profile and submits per-run environment values', async () => {
    const user = userEvent.setup();
    profileApi.profiles = [{
      id: 'profile-1', projectId: 'project-1', ownerId: 'user-1', name: 'Chrome staging',
      browser: 'Chrome 129', operatingSystem: 'macOS 15', device: 'Desktop', apiEnvironment: 'Staging',
      createdAt: '', updatedAt: '',
    }];
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole('button', { name: /Environment \(optional\)/ }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Saved profile (optional)' }), 'profile-1');
    expect(screen.getByRole('textbox', { name: 'Browser and version' })).toHaveValue('Chrome 129');
    expect(screen.getByRole('textbox', { name: 'API environment' })).toHaveValue('Staging');
    await user.clear(screen.getByRole('textbox', { name: 'Browser and version' }));
    await user.type(screen.getByRole('textbox', { name: 'Build' }), 'build-42');
    await user.click(screen.getByRole('button', { name: 'Start run' }));

    expect(onSubmit).toHaveBeenCalledWith({
      runKey: undefined,
      environment: {
        environmentProfileId: 'profile-1',
        browser: null,
        operatingSystem: 'macOS 15',
        device: 'Desktop',
        apiEnvironment: 'Staging',
        build: 'build-42',
        deployment: null,
      },
    });
  });

  it('creates, updates, and deletes personal project profiles', async () => {
    const user = userEvent.setup();
    const profile = {
      id: 'profile-1', projectId: 'project-1', ownerId: 'user-1', name: 'Chrome staging',
      browser: 'Chrome 129', operatingSystem: null, device: null, apiEnvironment: 'Staging', createdAt: '', updatedAt: '',
    };
    profileApi.create.mockReturnValue({ unwrap: () => Promise.resolve(profile) });
    profileApi.update.mockReturnValue({ unwrap: () => Promise.resolve({ ...profile, name: 'Chrome staging updated' }) });
    profileApi.remove.mockReturnValue({ unwrap: () => Promise.resolve(undefined) });
    profileApi.profiles = [profile];
    renderDialog();

    await user.click(screen.getByRole('button', { name: /Environment \(optional\)/ }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Saved profile (optional)' }), 'profile-1');
    await user.click(screen.getByRole('button', { name: 'Save as new profile' }));
    expect(profileApi.create).toHaveBeenCalledWith({
      projectId: 'project-1',
      manualRunEnvironmentProfileCreateRequest: {
        name: 'Chrome staging', browser: 'Chrome 129', operatingSystem: null, device: null, apiEnvironment: 'Staging',
      },
    });

    await user.click(screen.getByRole('button', { name: 'Update selected profile' }));
    expect(profileApi.update).toHaveBeenCalledWith(expect.objectContaining({ projectId: 'project-1', profileId: 'profile-1' }));

    await user.click(screen.getByRole('button', { name: 'Delete selected profile' }));
    await user.click(screen.getByRole('button', { name: 'Delete profile' }));
    expect(profileApi.remove).toHaveBeenCalledWith({ projectId: 'project-1', profileId: 'profile-1' });
  });

  it('requires explicit confirmation before retrying an uncertain start', async () => {
    const user = userEvent.setup();
    const { onSubmit, onRequireRetryConfirmation } = renderDialog({
      error: 'Inspect history before trying again.',
      isUncertain: true,
    });

    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(onRequireRetryConfirmation).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Inspect history before trying again.');
  });

  it('cancels without submitting', async () => {
    const user = userEvent.setup();
    const { onCancel, onSubmit } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
