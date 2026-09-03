// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { DeleteSkillDialog } from '@/components/ui/components/Dialogs/manage-skill';
import { useDeleteCustomSkillMutation } from '@/redux/apis/extendedApi';

vi.mock('@/redux/apis/extendedApi', () => ({ useDeleteCustomSkillMutation: vi.fn() }));

const mockedUseDeleteCustomSkillMutation = vi.mocked(useDeleteCustomSkillMutation);
const closeDialog = vi.fn();
const onDeleted = vi.fn();
const deleteSkill = vi.fn();

const renderDialog = () =>
  render(
    <ChakraProvider>
      <DeleteSkillDialog
        skillId="persisted-skill-id"
        skillTitle="Custom skill"
        closeDialog={closeDialog}
        closeAllDialogs={vi.fn()}
        onDeleted={onDeleted}
      />
    </ChakraProvider>,
  );

describe('DeleteSkillDialog', () => {
  beforeEach(() => {
    closeDialog.mockReset();
    onDeleted.mockReset();
    deleteSkill.mockReset();
    deleteSkill.mockReturnValue({ unwrap: async () => undefined });
    mockedUseDeleteCustomSkillMutation.mockReturnValue([deleteSkill, { isLoading: false }] as never);
  });

  it('cancels without issuing a request', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.getByText(/Custom skill/)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(deleteSkill).not.toHaveBeenCalled();
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('deletes by persisted ID and navigates only after success', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete skill' }));

    expect(deleteSkill).toHaveBeenCalledWith({ id: 'persisted-skill-id' });
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it.each([403, 404, 500])('retains confirmation state after a %s failure', async (status) => {
    const user = userEvent.setup();
    deleteSkill.mockReturnValue({ unwrap: async () => Promise.reject({ status }) });
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete skill' }));

    expect(await screen.findByText(/Skill deletion failed/)).toBeInTheDocument();
    expect(closeDialog).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete skill' })).toBeInTheDocument();
  });

  it('prevents duplicate confirmation while pending', () => {
    mockedUseDeleteCustomSkillMutation.mockReturnValue([deleteSkill, { isLoading: true }] as never);
    renderDialog();

    expect(screen.getByRole('button', { name: 'Delete skill' })).toBeDisabled();
  });
});
