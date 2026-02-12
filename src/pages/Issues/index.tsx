import { IssuesList } from '@/components/issues';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { useFilterContext, FilterProvider } from '@/contexts/FilterContext';

const IssuesPageContent = () => {
  const { showFilters } = useFilterContext();

  return (
    <MainTemplate pageHeader="Issues" isFilterVisible>
      <IssuesList showFilters={showFilters} />
    </MainTemplate>
  );
};

export const IssuesPage = () => (
  <FilterProvider storageKey="issues">
    <IssuesPageContent />
  </FilterProvider>
);
