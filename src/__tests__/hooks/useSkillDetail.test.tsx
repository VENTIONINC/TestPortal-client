// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSkillDetail } from '@/components/skills/hooks/useSkillDetail';
import { useGetApiV2SkillsByIdQuery } from '@/redux/apis/generatedApi';

const routeParams = vi.hoisted(() => ({ id: 'skill-custom-renamed' as string | undefined }));

vi.mock('react-router', () => ({ useParams: () => routeParams }));
vi.mock('@/redux/apis/generatedApi', () => ({ useGetApiV2SkillsByIdQuery: vi.fn() }));

const mockedSkillQuery = vi.mocked(useGetApiV2SkillsByIdQuery);

const HookProbe = () => {
  const detail = useSkillDetail();
  return <output>{detail.isNotFound ? 'not-found' : detail.skillId}</output>;
};

describe('useSkillDetail', () => {
  it('loads a direct, trimmed opaque ID independently of catalog state', () => {
    routeParams.id = ' skill-custom-renamed ';
    mockedSkillQuery.mockReturnValue({ data: undefined, isLoading: false, isFetching: false, error: undefined } as never);

    render(<HookProbe />);

    expect(mockedSkillQuery).toHaveBeenCalledWith({ id: 'skill-custom-renamed' });
    expect(screen.getByText('skill-custom-renamed')).toBeInTheDocument();
  });

  it('maps backend 404 responses to the not-found state', () => {
    routeParams.id = 'unknown-id';
    mockedSkillQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 404 },
    } as never);

    render(<HookProbe />);

    expect(screen.getByText('not-found')).toBeInTheDocument();
  });

  it('skips the query when the route ID is empty', () => {
    routeParams.id = '   ';
    mockedSkillQuery.mockReturnValue({ data: undefined, isLoading: false, isFetching: false, error: undefined } as never);

    render(<HookProbe />);

    expect(mockedSkillQuery).toHaveBeenCalledWith(expect.any(Symbol));
  });
});
