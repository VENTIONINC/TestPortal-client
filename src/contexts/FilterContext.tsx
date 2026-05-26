// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  showFilters: boolean;
  isTransitioning: boolean;
  toggleFilters: () => void;
  setShowFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const getFilterState = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : true;
};
const setFilterState = (key: string, value: boolean) => {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
};

export const FilterProvider = ({ children, storageKey = 'common' }: { children: ReactNode; storageKey?: string }) => {
  const key = `show_filters_${storageKey}`;

  const [showFilters, setShowFiltersState] = useState(() => getFilterState(key));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerTransition = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 400);
  }, []);

  const handleSetShowFilters = useCallback(
    () => {
      triggerTransition();
      setShowFiltersState((prev: boolean) => setFilterState(key, !prev));
    },
    [key, triggerTransition],
  );

  const toggleFilters = useCallback(() => {
    handleSetShowFilters();
  }, [handleSetShowFilters]);

  return (
    <FilterContext.Provider
      value={{
        showFilters,
        isTransitioning,
        toggleFilters,
        setShowFilters: handleSetShowFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    // Return a dummy context to avoid crashes in components (like MainTemplate)
    // that are used outside of a FilterProvider but conditionally render filter UI.
    return {
      showFilters: true,
      isTransitioning: false,
      toggleFilters: () => {},
      setShowFilters: () => {},
    };
  }
  return context;
};
