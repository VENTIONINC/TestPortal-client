import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  showFilters: boolean;
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

  const handleSetShowFilters = useCallback(
    () => setShowFiltersState((prev: boolean) => setFilterState(key, !prev)),
    [key],
  );

  const toggleFilters = useCallback(() => {
    handleSetShowFilters();
  }, [handleSetShowFilters]);

  return (
    <FilterContext.Provider
      value={{
        showFilters,
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
      toggleFilters: () => {},
      setShowFilters: () => {},
    };
  }
  return context;
};
