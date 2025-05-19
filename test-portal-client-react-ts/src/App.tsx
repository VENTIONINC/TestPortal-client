import { useState } from 'react';
import './App.css';
import { useFilterParams } from './hooks/useFilterParams';
import { useResultsQuery } from './hooks/useResultsQuery';
import Results from './components/Results';
import Issues from './components/Issues';
import { toModels } from './utils/toModels';
import type { ModelledResultRecord } from './utils/toModels';

type ActiveTab = 'results' | 'issues';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('results');
  const { filterParams, setFilterParams } = useFilterParams();
  const {
    data: apiResults,
    isLoading,
    isError,
    error,
  } = useResultsQuery(filterParams);

  const modelledResults: ModelledResultRecord[] | undefined = apiResults
    ? toModels(apiResults)
    : undefined;

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => switchTab('results')}
        >
          Results
        </div>
        <div
          className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => switchTab('issues')}
        >
          Issues
        </div>
      </div>

      <div className="content">
        {activeTab === 'results' && (
          <>
            {isLoading && <p>....loading</p>}
            {isError && <p>Error loading results: {error?.message}</p>}
            {!isLoading &&
              !isError &&
              modelledResults &&
              modelledResults.length > 0 && (
                <Results
                  results={modelledResults}
                  filterParams={filterParams}
                  setFilterParams={setFilterParams}
                />
              )}
            {!isLoading &&
              !isError &&
              (!modelledResults || modelledResults.length === 0) && (
                <p>No results found.</p>
              )}
          </>
        )}
        {activeTab === 'issues' && <Issues />}
      </div>
    </>
  );
}

export default App;
