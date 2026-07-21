// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { SkillDetailView } from '@/components/skills/containers/SkillDetailView';
import { useSkillDetail, useSkillDownloads } from '@/components/skills/hooks';

import { skillsFixture } from '../../fixtures/skills';

const openDialog = vi.fn();

vi.mock('@/components/skills/hooks', () => ({
  useSkillDetail: vi.fn(),
  useSkillDownloads: vi.fn(),
}));
vi.mock('@/redux/slices/dialog', () => ({ useDialogActions: () => ({ openDialog }) }));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));

const mockedUseSkillDetail = vi.mocked(useSkillDetail);
const mockedUseSkillDownloads = vi.mocked(useSkillDownloads);

describe('SkillDetailView', () => {
  beforeEach(() => {
    openDialog.mockReset();
  });

  it('keeps Markdown in the preview and exposes only the ZIP package action', () => {
    mockedUseSkillDetail.mockReturnValue({
      skillId: skillsFixture[0].id,
      skill: undefined,
      metadata: skillsFixture[0],
      content: '# Preview source',
      isLoading: false,
      isFetching: false,
      isInitialLoading: false,
      isRefetching: false,
      error: undefined,
      isNotFound: false,
      hasInvalidSkillId: false,
    });
    mockedUseSkillDownloads.mockReturnValue({
      archiveError: undefined,
      isDownloadingArchive: false,
      handleArchiveDownload: vi.fn(),
    });

    render(
      <ChakraProvider>
        <SkillDetailView />
      </ChakraProvider>,
    );

    expect(mockedUseSkillDownloads).toHaveBeenCalledWith(skillsFixture[0].downloadUrl, skillsFixture[0].name);
    expect(screen.getByText('Preview source')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download ZIP package' })).toBeInTheDocument();
    expect(screen.queryByText('Download SKILL.md')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Replace skill' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete skill' })).not.toBeInTheDocument();
  });

  it('shows management actions only for writable custom skills', async () => {
    const user = userEvent.setup();
    mockedUseSkillDetail.mockReturnValue({
      skillId: skillsFixture[1].id,
      skill: undefined,
      metadata: skillsFixture[1],
      content: '# Replacement preview',
      isLoading: false,
      isFetching: false,
      isInitialLoading: false,
      isRefetching: false,
      error: undefined,
      isNotFound: false,
      hasInvalidSkillId: false,
    });
    mockedUseSkillDownloads.mockReturnValue({
      archiveError: undefined,
      isDownloadingArchive: false,
      handleArchiveDownload: vi.fn(),
    });

    render(
      <ChakraProvider>
        <SkillDetailView />
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Replace skill' }));
    await user.click(screen.getByRole('button', { name: 'Delete skill' }));

    expect(openDialog).toHaveBeenNthCalledWith(1, expect.any(Function), {
      mode: 'replace',
      skill: skillsFixture[1],
    });
    expect(openDialog).toHaveBeenNthCalledWith(2, expect.any(Function), {
      skillId: skillsFixture[1].id,
      skillTitle: skillsFixture[1].title,
      onDeleted: expect.any(Function),
    });
    expect(screen.getByText('Replacement preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download ZIP package' })).toBeInTheDocument();
  });
});
