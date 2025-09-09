import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';

interface ResultsSelectionContextType {
  selectedIds: Set<number>;
  isSelected: (id: number) => boolean;
  toggleSelection: (id: number) => void;
  toggleMultiple: (ids: number[]) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  getSelectedIds: () => number[];
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const isSelected = useCallback((id: number) => selectedIds.has(id), [selectedIds]);

  const toggleSelection = useCallback((id: number) => {
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

  const toggleMultiple = useCallback((ids: number[]) => {
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

  const selectAll = useCallback((ids: number[]) => {
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
