// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toaster } from '@/components/ui';
import { usePostApiV2UploadJsonReportMutation } from '@/redux/apis/generatedApi';
import { usePostApiV2UploadCtrfReportMutation } from '@/redux/apis/extendedApi';
import { useResultsFileUpload } from '@/components/ui/components/Dialogs/results-file-upload/hooks';

const clearFiles = vi.fn();
const acceptedFiles = [new File(['{}'], 'report.json', { type: 'application/json' })];

vi.mock('@chakra-ui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@chakra-ui/react')>()),
  useFileUpload: () => ({ acceptedFiles, clearFiles }),
}));

vi.mock('@/components/ui', () => ({
  toaster: { create: vi.fn() },
}));

vi.mock('@/redux/apis/generatedApi', () => ({
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
    expect(toaster.create).toHaveBeenCalledWith({ title: 'Files uploaded', type: 'success' });
    expect(closeDialog).toHaveBeenCalledOnce();
  });

  it('shows an error and keeps the dialog open when the API rejects the upload', async () => {
    const unwrap = vi.fn().mockRejectedValue(new Error('Transaction expired'));
    uploadCtrfReport.mockReturnValue({ unwrap });
    const { result } = renderHook(() => useResultsFileUpload(closeDialog, 'ctrf'));

    await act(async () => result.current.handleUpload());

    expect(unwrap).toHaveBeenCalledOnce();
    expect(toaster.create).toHaveBeenCalledWith({ title: 'Failed to upload files', type: 'error' });
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
});
