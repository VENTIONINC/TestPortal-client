// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';

import type { TestScenarioFormProps } from '../TestScenarioForm';

export const useScenarioFolderPicker = (
  initialFolderId: string | null,
  folders: NonNullable<TestScenarioFormProps['folders']>,
) => {
  const [folderId, setFolderId] = useState(initialFolderId);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderSearch, setFolderSearch] = useState('');
  const folderSearchRef = useRef<HTMLInputElement>(null);
  const folder = folderId ? folders.find((f) => f.id === folderId) : null;
  const filteredFolders = [{ id: '', name: 'No folder', depth: 0, path: 'No folder' }, ...folders].filter((item) =>
    (item.path ?? item.name).toLowerCase().includes(folderSearch.toLowerCase().trim()),
  );
  const selectFolder = (id: string) => {
    setFolderId(id || null);
    setFolderOpen(false);
    setFolderSearch('');
  };
  const changeFolderOpen = (open: boolean) => {
    setFolderOpen(open);
    if (!open) setFolderSearch('');
  };

  return {
    folderId,
    setFolderId,
    folder,
    filteredFolders,
    selectFolder,
    folderOpen,
    changeFolderOpen,
    folderSearch,
    setFolderSearch,
    folderSearchRef,
  };
};
