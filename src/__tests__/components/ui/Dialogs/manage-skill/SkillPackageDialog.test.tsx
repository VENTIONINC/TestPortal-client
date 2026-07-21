// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { SkillPackageDialog } from '@/components/ui/components/Dialogs/manage-skill';
import { useCreateCustomSkillMutation, useReplaceCustomSkillMutation } from '@/redux/apis/extendedApi';

import { skillsFixture } from '../../../../fixtures/skills';

vi.mock('@/redux/apis/extendedApi', () => ({
  useCreateCustomSkillMutation: vi.fn(),
  useReplaceCustomSkillMutation: vi.fn(),
}));

const mockedUseCreateCustomSkillMutation = vi.mocked(useCreateCustomSkillMutation);
const mockedUseReplaceCustomSkillMutation = vi.mocked(useReplaceCustomSkillMutation);
const closeDialog = vi.fn();
const createSkill = vi.fn();
const replaceSkill = vi.fn();

const mutationResult = (unwrap: () => Promise<unknown>) => ({ unwrap });

const renderDialog = (mode: 'create' | 'replace' = 'create') =>
  render(
    <ChakraProvider>
      <SkillPackageDialog
        mode={mode}
        skill={mode === 'replace' ? skillsFixture[1] : undefined}
        closeDialog={closeDialog}
        closeAllDialogs={vi.fn()}
      />
    </ChakraProvider>,
  );

describe('SkillPackageDialog', () => {
  beforeEach(() => {
    closeDialog.mockReset();
    createSkill.mockReset();
    replaceSkill.mockReset();
    createSkill.mockReturnValue(mutationResult(async () => skillsFixture[1]));
    replaceSkill.mockReturnValue(mutationResult(async () => skillsFixture[1]));
    mockedUseCreateCustomSkillMutation.mockReturnValue([createSkill, { isLoading: false }] as never);
    mockedUseReplaceCustomSkillMutation.mockReturnValue([replaceSkill, { isLoading: false }] as never);
  });

  it('starts create mode empty and reports every required field', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Create skill' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
    expect(screen.getByText('A ZIP package is required')).toBeInTheDocument();
    expect(createSkill).not.toHaveBeenCalled();
  });

  it('pre-populates replace metadata, requires a new ZIP, and addresses the persisted ID', async () => {
    const user = userEvent.setup();
    renderDialog('replace');

    expect(screen.getByLabelText('Title')).toHaveValue(skillsFixture[1].title);
    expect(screen.getByLabelText('Category')).toHaveValue(skillsFixture[1].category);
    expect(screen.getByText(/fully replace package-derived metadata/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Replace skill' }));
    expect(await screen.findByText('A ZIP package is required')).toBeInTheDocument();

    const packageFile = new File(['package-content'], 'replacement.zip', { type: 'application/zip' });
    await user.upload(screen.getByLabelText('ZIP package'), packageFile);
    await user.click(screen.getByRole('button', { name: 'Replace skill' }));

    await waitFor(() =>
      expect(replaceSkill).toHaveBeenCalledWith({
        id: skillsFixture[1].id,
        title: skillsFixture[1].title,
        category: skillsFixture[1].category,
        package: packageFile,
      }),
    );
    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  it('preserves entered values, selected file, and backend feedback after a conflict', async () => {
    const user = userEvent.setup();
    createSkill.mockReturnValue(
      mutationResult(async () => Promise.reject({ status: 409, data: { error: 'A skill with this name already exists.' } })),
    );
    renderDialog();

    const packageFile = new File(['package-content'], 'duplicate.zip', { type: 'application/zip' });
    await user.type(screen.getByLabelText('Title'), 'Duplicate title');
    await user.type(screen.getByLabelText('Category'), 'Engineering');
    await user.upload(screen.getByLabelText('ZIP package'), packageFile);
    await user.click(screen.getByRole('button', { name: 'Create skill' }));

    expect(await screen.findByText('A skill with this name already exists.')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Duplicate title');
    expect(screen.getByLabelText('Category')).toHaveValue('Engineering');
    expect(screen.getByText('Selected: duplicate.zip')).toBeInTheDocument();
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it('disables submission while a request is pending', () => {
    mockedUseCreateCustomSkillMutation.mockReturnValue([createSkill, { isLoading: true }] as never);
    renderDialog();

    expect(screen.getByRole('button', { name: 'Create skill' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
