// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toaster } from '@/components/ui';
import {
  useGetApiV2ProjectsQuery,
  usePostApiV2UploadJsonReportMutation,
} from '@/redux/apis/generatedApi';
import { usePostApiV2UploadCtrfReportMutation } from '@/redux/apis/extendedApi';
import {
  getResultsFileUploadLimitMessage,
  hasTooManyFilesRejection,
  useResultsFileUpload,
} from '@/components/ui/components/Dialogs/results-file-upload/hooks';

const clearFiles = vi.fn();
const clearRejectedFiles = vi.fn();
let acceptedFiles = [new File(['{}'], 'report.json', { type: 'application/json' })];
let useFileUploadOptions: { onFileChange?: (details: unknown) => void } | undefined;

vi.mock('@chakra-ui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@chakra-ui/react')>()),
  useFileUpload: (options: { onFileChange?: (details: unknown) => void }) => {
    useFileUploadOptions = options;
    return { acceptedFiles, clearFiles, clearRejectedFiles, rejectedFiles: [] };
  },
}));

vi.mock('@/components/ui', () => ({
  toaster: { create: vi.fn() },
}));

vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ProjectsQuery: vi.fn(),
  usePostApiV2UploadJsonReportMutation: vi.fn(),
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  usePostApiV2UploadCtrfReportMutation: vi.fn(),
}));

vi.mock('@/redux/slices/projects', () => ({
  useSelectedProjectId: () => 'project-123',
}));

vi.mock('@/redux/slices/dialog', () => ({
  useDialogActions: () => ({ openDialog: vi.fn() }),
}));

describe('useResultsFileUpload', () => {
  const uploadJsonReport = vi.fn();
  const uploadCtrfReport = vi.fn();
  const closeDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useFileUploadOptions = undefined;
    acceptedFiles = [new File(['{}'], 'report.json', { type: 'application/json' })];
    vi.mocked(useGetApiV2ProjectsQuery).mockReturnValue({
      data: [{ id: 'project-123', isActive: true }],
    } as unknown as ReturnType<typeof useGetApiV2ProjectsQuery>);
    vi.mocked(usePostApiV2UploadJsonReportMutation).mockReturnValue([
      uploadJsonReport,
      {} as ReturnType<typeof usePostApiV2UploadJsonReportMutation>[1],
    ]);
    vi.mocked(usePostApiV2UploadCtrfReportMutation).mockReturnValue([
      uploadCtrfReport,
      {} as ReturnType<typeof usePostApiV2UploadCtrfReportMutation>[1],
    ]);
  });

  it('shows success only after the CTRF upload is unwrapped successfully', async () => {
    const unwrap = vi.fn().mockResolvedValue({ success: true });
    uploadCtrfReport.mockReturnValue({ unwrap });
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'ctrf'));

    await act(async () => result.current.handleUpload());

    expect(unwrap).toHaveBeenCalledOnce();
    expect(uploadCtrfReport).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.any(FormData) }),
    );
    const formData = uploadCtrfReport.mock.calls[0][0].body as FormData;
    expect(formData.get('projectId')).toBe('project-123');
    expect(toaster.create).toHaveBeenCalledWith({ title: 'Files uploaded', type: 'success' });
    expect(closeDialog).toHaveBeenCalledOnce();
  });

  it('shows the backend validation error and keeps the dialog open', async () => {
    const backendMessage =
      'Import failed for file "invalid-results.ctrf.json". Future test execution timestamps were detected. 2 timestamps exceed the allowed 10-minute tolerance. Maximum deviation: 45m. No data was imported.';
    const unwrap = vi.fn().mockRejectedValue({
      status: 400,
      data: { error: backendMessage },
    });
    uploadCtrfReport.mockReturnValue({ unwrap });
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'ctrf'));

    await act(async () => result.current.handleUpload());

    expect(unwrap).toHaveBeenCalledOnce();
    expect(toaster.create).toHaveBeenCalledWith({
      title: 'Failed to upload file',
      description: backendMessage,
      type: 'error',
    });
    expect(toaster.create).not.toHaveBeenCalledWith({ title: 'Files uploaded', type: 'success' });
    expect(closeDialog).not.toHaveBeenCalled();
    expect(clearFiles).not.toHaveBeenCalled();
  });

  it('unwraps Playwright uploads as well', async () => {
    const unwrap = vi.fn().mockResolvedValue({ success: true });
    uploadJsonReport.mockReturnValue({ unwrap });
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'playwright'));

    await act(async () => result.current.handleUpload());

    expect(unwrap).toHaveBeenCalledOnce();
  });

  it('submits every selected file independently when one file is rejected', async () => {
    acceptedFiles = [
      new File(['{}'], 'valid.json', { type: 'application/json' }),
      new File(['{}'], 'invalid.json', { type: 'application/json' }),
    ];
    uploadCtrfReport
      .mockReturnValueOnce({ unwrap: vi.fn().mockResolvedValue({ success: true }) })
      .mockReturnValueOnce({
        unwrap: vi.fn().mockRejectedValue({
          status: 400,
          data: { error: 'Future test execution timestamps were detected' },
        }),
      });
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'ctrf'));

    await act(async () => result.current.handleUpload());

    expect(uploadCtrfReport).toHaveBeenCalledTimes(2);
    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' }),
    );
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it('sets a validation message when the file limit is exceeded', () => {
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'ctrf'));

    act(() => {
      useFileUploadOptions?.onFileChange?.({
        acceptedFiles: [],
        rejectedFiles: [{ file: new File(['{}'], 'report.json'), errors: ['TOO_MANY_FILES'] }],
      });
    });

    expect(result.current.fileSelectionError).toBe(getResultsFileUploadLimitMessage());
  });

  it('clears the validation message when the selection is reset', () => {
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'ctrf'));

    act(() => {
      useFileUploadOptions?.onFileChange?.({
        acceptedFiles: [],
        rejectedFiles: [{ file: new File(['{}'], 'report.json'), errors: ['TOO_MANY_FILES'] }],
      });
    });
    act(() => result.current.clearSelectedFiles());

    expect(result.current.fileSelectionError).toBeNull();
    expect(clearFiles).toHaveBeenCalledOnce();
    expect(clearRejectedFiles).toHaveBeenCalledOnce();
  });
});

describe('results file upload helpers', () => {
  it('detects TOO_MANY_FILES rejections', () => {
    expect(
      hasTooManyFilesRejection([{ file: new File([], 'a.json'), errors: ['FILE_INVALID_TYPE'] }]),
    ).toBe(false);
    expect(
      hasTooManyFilesRejection([{ file: new File([], 'a.json'), errors: ['TOO_MANY_FILES'] }]),
    ).toBe(true);
  });
});
