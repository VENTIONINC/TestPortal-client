// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';

interface ResultsSelectionContextType {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  toggleMultiple: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  getSelectedIds: () => string[];
  getSelectedCount: () => number;
}

const ResultsSelectionContext = createContext<ResultsSelectionContextType | undefined>(undefined);

export const useResultsSelection = () => {
  const context = useContext(ResultsSelectionContext);
  if (!context) {
    throw new Error('useResultsSelection must be used within a ResultsSelectionProvider');
  }

  return context;
};

export const ResultsSelectionProvider = ({ children }: PropsWithChildren) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleMultiple = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      const allSelected = ids.every((id) => newSet.has(id));

      if (allSelected) {
        ids.forEach((id) => newSet.delete(id));
      } else {
        ids.forEach((id) => newSet.add(id));
      }

      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      const allSelected = ids.every((id) => newSet.has(id));

      if (allSelected) {
        ids.forEach((id) => newSet.delete(id));
      } else {
        ids.forEach((id) => newSet.add(id));
      }

      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedIds = useCallback(() => Array.from(selectedIds), [selectedIds]);

  const getSelectedCount = useCallback(() => selectedIds.size, [selectedIds]);

  const value = {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleMultiple,
    selectAll,
    clearSelection,
    getSelectedIds,
    getSelectedCount,
  };

  return <ResultsSelectionContext.Provider value={value}>{children}</ResultsSelectionContext.Provider>;
};
