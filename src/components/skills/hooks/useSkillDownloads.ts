// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { toaster } from '@/components/ui';
import { useLazyDownloadSkillArchiveQuery, useLazyDownloadSkillMarkdownQuery } from '@/redux/apis/extendedApi';
import { triggerBrowserDownload } from '@/utils';
import { extractApiError } from '@/utils/apiErrors';

const getDownloadErrorMessage = (error: unknown) =>
  error && typeof error === 'object'
    ? extractApiError(error as FetchBaseQueryError | SerializedError)
    : 'Download failed. Please try again.';

export const useSkillDownloads = (skillName: string) => {
  const [markdownError, setMarkdownError] = useState<string>();
  const [archiveError, setArchiveError] = useState<string>();
  const [downloadMarkdown, { isFetching: isDownloadingMarkdown }] = useLazyDownloadSkillMarkdownQuery();
  const [downloadArchive, { isFetching: isDownloadingArchive }] = useLazyDownloadSkillArchiveQuery();

  const handleMarkdownDownload = useCallback(async () => {
    if (!skillName) {
      return;
    }

    setMarkdownError(undefined);

    try {
      const result = await downloadMarkdown({ name: skillName }).unwrap();

      triggerBrowserDownload({
        file: result.content,
        fileName: result.fileName,
        mimeType: 'text/markdown;charset=utf-8',
      });

      toaster.create({
        title: 'Markdown download started',
        description: `${result.fileName} is downloading.`,
        type: 'success',
      });
    } catch (error) {
      const message = getDownloadErrorMessage(error);
      setMarkdownError(message);
      toaster.create({ title: 'Markdown download failed', description: message, type: 'error' });
    }
  }, [downloadMarkdown, skillName]);

  const handleArchiveDownload = useCallback(async () => {
    if (!skillName) {
      return;
    }

    setArchiveError(undefined);

    try {
      const result = await downloadArchive({ name: skillName }).unwrap();

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
  }, [downloadArchive, skillName]);

  return {
    markdownError,
    archiveError,
    isDownloadingMarkdown,
    isDownloadingArchive,
    handleMarkdownDownload,
    handleArchiveDownload,
  };
};
