// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePromptBuilder } from '@/components/prompts/hooks/usePromptBuilder';

const state = vi.hoisted(() => ({ selected: 'a', projects: [{ id: 'a', name: 'Alpha', isActive: true }, { id: 'b', name: 'Beta', isActive: true }, { id: 'c', name: 'Inactive', isActive: false }], loading: false, error: undefined as unknown, generate: vi.fn() }));
vi.mock('@/redux/slices/projects', () => ({ useSelectedProjectId: () => state.selected, useProjectsActions: () => ({ setSelectedProjectId: (id: string) => { state.selected = id; } }) }));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ProjectsQuery: () => ({ data: state.projects, isLoading: state.loading, error: state.error }),
  useGetApiV2PromptsByNameQuery: ({ name }: { name: string }) => ({ currentData: { name, parameters: name === 'tms-workflow-assistant' ? { project_id: { required: false }, task: { required: false }, execution_mode: { required: false } } : { result_id: { required: false } } }, isFetching: false }),
  usePostApiV2PromptsByNameGenerateMutation: () => [state.generate],
}));

const success = (text: string) => ({ unwrap: () => Promise.resolve({ generated_prompt: text }) });
describe('usePromptBuilder', () => {
  beforeEach(() => { state.selected = 'a'; state.loading = false; state.error = undefined; state.generate.mockReset().mockReturnValue(success('Alpha a')); });
  it('blocks missing, stale, inactive, loading, empty and failed projects', () => {
    const { result, rerender } = renderHook(() => usePromptBuilder('tms-workflow-assistant'));
    expect(result.current.project?.name).toBe('Alpha');
    for (const id of ['', 'missing', 'c']) { state.selected = id; rerender(); expect(result.current.requiredFieldsEmpty).toBe(true); }
    state.selected = 'a'; state.loading = true; rerender(); expect(result.current.requiredFieldsEmpty).toBe(true);
    state.loading = false; state.error = { message: 'offline' }; rerender(); expect(result.current.requiredFieldsEmpty).toBe(true);
    state.error = undefined; const projects = state.projects; state.projects = []; rerender(); expect(result.current.requiredFieldsEmpty).toBe(true); state.projects = projects;
  });
  it('sends project and optional modes and omits cleared task and mode', async () => {
    const { result } = renderHook(() => usePromptBuilder('tms-workflow-assistant'));
    await act(async () => { await result.current.handleGenerate(); });
    expect(state.generate).toHaveBeenLastCalledWith({ name: 'tms-workflow-assistant', generatePromptRequest: { project_id: 'a' } });
    for (const mode of ['human_guided', 'client_executed']) {
      act(() => { result.current.handleParameterChange('task', 'Retest'); result.current.handleParameterChange('execution_mode', mode); });
      await act(async () => { await result.current.handleGenerate(); });
      expect(state.generate).toHaveBeenLastCalledWith({ name: 'tms-workflow-assistant', generatePromptRequest: { project_id: 'a', task: 'Retest', execution_mode: mode } });
    }
    act(() => { result.current.handleParameterChange('task', '  '); result.current.handleParameterChange('execution_mode', ''); });
    await act(async () => { await result.current.handleGenerate(); });
    expect(state.generate).toHaveBeenLastCalledWith({ name: 'tms-workflow-assistant', generatePromptRequest: { project_id: 'a' } });
  });
  it('rejects outdated responses after switching projects and overlapping requests', async () => {
    const resolvers: Array<(value: { generated_prompt: string }) => void> = [];
    state.generate.mockImplementation(() => ({ unwrap: () => new Promise(resolve => resolvers.push(resolve)) }));
    const { result, rerender } = renderHook(() => usePromptBuilder('tms-workflow-assistant'));
    act(() => { void result.current.handleGenerate(); });
    state.selected = 'b'; rerender();
    act(() => { void result.current.handleGenerate(); });
    await act(async () => { resolvers[1]({ generated_prompt: 'Beta b' }); });
    await act(async () => { resolvers[0]({ generated_prompt: 'Alpha a' }); });
    expect(result.current.generatedPrompt).toBe('Beta b');
    state.selected = 'a'; rerender(); expect(result.current.generatedPrompt).toBe('');
  });
  it('keeps the newest response when a manual request overlaps the debounce', async () => {
    vi.useFakeTimers();
    const resolvers: Array<(value: { generated_prompt: string }) => void> = [];
    state.generate.mockImplementation(() => ({ unwrap: () => new Promise(resolve => resolvers.push(resolve)) }));
    const { result, unmount } = renderHook(() => usePromptBuilder('tms-workflow-assistant'));
    act(() => { void result.current.handleGenerate(); });
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(resolvers).toHaveLength(2);
    await act(async () => { resolvers[1]({ generated_prompt: 'new a' }); });
    await act(async () => { resolvers[0]({ generated_prompt: 'old a' }); });
    expect(result.current.generatedPrompt).toBe('new a');
    unmount(); vi.useRealTimers();
  });
  it('shows field errors and recovers on a subsequent generation', async () => {
    state.generate.mockReturnValueOnce({ unwrap: () => Promise.reject({ data: { error: 'Invalid prompt parameters', fields: [{ field: 'task', message: 'Required' }] } }) }).mockReturnValue(success('latest a'));
    const { result } = renderHook(() => usePromptBuilder('tms-workflow-assistant'));
    await act(async () => { await result.current.handleGenerate(); });
    expect(result.current.validationErrors.task).toBe('Required');
    expect(result.current.generateError).toBe('Invalid prompt parameters');
    await act(async () => { await result.current.handleGenerate(); });
    await waitFor(() => expect(result.current.generatedPrompt).toBe('latest a'));
    expect(result.current.generateError).toBeUndefined();
  });
  it('resets task and mode when returning to a previously edited prompt', async () => {
    const { result, rerender } = renderHook(({ name }) => usePromptBuilder(name), {
      initialProps: { name: 'tms-workflow-assistant' },
    });
    act(() => {
      result.current.handleParameterChange('task', 'Retest');
      result.current.handleParameterChange('execution_mode', 'client_executed');
    });
    await act(async () => { await result.current.handleGenerate(); });

    rerender({ name: 'developer-code-assistant' });
    rerender({ name: 'tms-workflow-assistant' });

    expect(result.current.parameterValues).toEqual({});
    expect(result.current.generatedPrompt).toBe('');
    await act(async () => { await result.current.handleGenerate(); });
    expect(state.generate).toHaveBeenLastCalledWith({
      name: 'tms-workflow-assistant',
      generatePromptRequest: { project_id: 'a' },
    });
  });
  it('preserves legacy generation without a project and resets on builder navigation', async () => {
    state.selected = '';
    const { result, rerender } = renderHook(({ name }) => usePromptBuilder(name), { initialProps: { name: 'developer-code-assistant' } });
    act(() => result.current.handleParameterChange('result_id', '123'));
    await act(async () => { await result.current.handleGenerate(); });
    expect(state.generate).toHaveBeenLastCalledWith({ name: 'developer-code-assistant', generatePromptRequest: { result_id: '123' } });
    expect(result.current.generatedPrompt).toBe('Alpha a');
    rerender({ name: 'tms-workflow-assistant' });
    expect(result.current.generatedPrompt).toBe('');
    expect(result.current.requiredFieldsEmpty).toBe(true);
    expect(result.current.parameterValues).toEqual({});
    rerender({ name: 'software-documentation-assistant' });
    expect(result.current.requiredFieldsEmpty).toBe(false);
    await act(async () => { await result.current.handleGenerate(); });
    expect(state.generate).toHaveBeenLastCalledWith({ name: 'software-documentation-assistant', generatePromptRequest: {} });
  });
});
