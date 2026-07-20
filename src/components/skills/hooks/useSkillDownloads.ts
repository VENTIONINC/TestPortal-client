// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { toaster } from '@/components/ui';
import { useLazyDownloadSkillArchiveQuery } from '@/redux/apis/extendedApi';
import { triggerBrowserDownload } from '@/utils';
import { extractApiError } from '@/utils/apiErrors';

const getDownloadErrorMessage = (error: unknown) =>
  error && typeof error === 'object'
    ? extractApiError(error as FetchBaseQueryError | SerializedError)
    : 'Download failed. Please try again.';

export const useSkillDownloads = (downloadUrl?: string, skillName?: string) => {
  const [archiveError, setArchiveError] = useState<string>();
  const [downloadArchive, { isFetching: isDownloadingArchive }] = useLazyDownloadSkillArchiveQuery();

  const handleArchiveDownload = useCallback(async () => {
    if (!downloadUrl || !skillName) {
      return;
    }

    setArchiveError(undefined);

    try {
      const result = await downloadArchive({ downloadUrl, name: skillName }).unwrap();

      triggerBrowserDownload({
        file: result.blob,
        fileName: result.fileName,
        mimeType: 'application/zip',
      });

      toaster.create({
        title: 'Archive download started',
        description: `${result.fileName} is downloading.`,
        type: 'success',
      });
    } catch (error) {
      const message = getDownloadErrorMessage(error);
      setArchiveError(message);
      toaster.create({ title: 'Archive download failed', description: message, type: 'error' });
    }
  }, [downloadArchive, downloadUrl, skillName]);

  return {
    archiveError,
    isDownloadingArchive,
    handleArchiveDownload,
  };
};
