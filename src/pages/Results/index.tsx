import { ResultContainer } from '@/components/results';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { useFilterContext, FilterProvider } from '@/contexts/FilterContext';

const ResultsPageContent = () => {
  const { showFilters } = useFilterContext();

  return (
    <MainTemplate pageHeader="Results" isFilterVisible>
      <ResultContainer showFilters={showFilters} />
    </MainTemplate>
  );
};

export const ResultsPage = () => (
  <FilterProvider storageKey="results">
    <ResultsPageContent />
  </FilterProvider>
);
