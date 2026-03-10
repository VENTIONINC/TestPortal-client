import { ResultContainer } from '@/components/results';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { FilterProvider } from '@/contexts/FilterContext';

const ResultsPageContent = () => (
  <MainTemplate pageHeader="Results">
    <ResultContainer />
  </MainTemplate>
);

export const ResultsPage = () => (
  <FilterProvider storageKey="results">
    <ResultsPageContent />
  </FilterProvider>
);
