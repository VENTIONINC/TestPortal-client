// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { useSkillsCatalog } from '@/components/skills/hooks';
import { SkillsCatalogView } from '@/components/skills/containers/SkillsCatalogView';

import { skillsFixture } from '../../fixtures/skills';

const navigate = vi.fn();
const openDialog = vi.fn();

vi.mock('react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@/components/skills/hooks', () => ({ useSkillsCatalog: vi.fn() }));
vi.mock('@/redux/slices/dialog', () => ({ useDialogActions: () => ({ openDialog }) }));

const mockedUseSkillsCatalog = vi.mocked(useSkillsCatalog);

describe('SkillsCatalogView', () => {
  beforeEach(() => {
    navigate.mockReset();
    openDialog.mockReset();
    mockedUseSkillsCatalog.mockReturnValue({
      skills: skillsFixture,
      isLoading: false,
      isInitialLoading: false,
      isFetching: false,
      isRefetching: false,
      error: undefined,
      isEmpty: false,
    });
  });

  it('navigates using the selected skill ID when names are duplicated', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <SkillsCatalogView />
      </ChakraProvider>,
    );

    await user.click(screen.getAllByText('View details')[1]);

    expect(navigate).toHaveBeenCalledWith('/skills/skill-custom-renamed');
    expect(navigate).not.toHaveBeenCalledWith('/skills/testing-guide');
  });

  it('opens create mode from the catalog header', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <SkillsCatalogView />
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Create skill' }));

    expect(openDialog).toHaveBeenCalledWith(expect.any(Function), { mode: 'create' });
  });
});
