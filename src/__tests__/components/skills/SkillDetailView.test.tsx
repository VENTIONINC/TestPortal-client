// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { SkillDetailView } from '@/components/skills/containers/SkillDetailView';
import { useSkillDetail, useSkillDownloads } from '@/components/skills/hooks';

import { skillsFixture } from '../../fixtures/skills';

vi.mock('@/components/skills/hooks', () => ({
  useSkillDetail: vi.fn(),
  useSkillDownloads: vi.fn(),
}));

const mockedUseSkillDetail = vi.mocked(useSkillDetail);
const mockedUseSkillDownloads = vi.mocked(useSkillDownloads);

describe('SkillDetailView', () => {
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
  });
});
