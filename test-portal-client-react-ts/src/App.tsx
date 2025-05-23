import { useState } from "react";
import "./App.css";
import { useFilterParams } from "./hooks/useFilterParams";
import { useResultsQuery } from "./hooks/useResultsQuery";
import Results from "./components/Results";
import { Issues } from "@/components/Issues";
import { toModels } from "./utils/toModels";
import type { ModelledResultRecord } from "./utils/toModels";

enum ACTIVE_TAB {
  Results = "results",
  Issues = "issues",
}

function App() {
  const [activeTab, setActiveTab] = useState<ACTIVE_TAB>(ACTIVE_TAB.Results);
  const { filterParams, setFilterParams } = useFilterParams();
  const { data: apiResults } = useResultsQuery(filterParams);

  const modelledResults: ModelledResultRecord[] | undefined = apiResults
    ? toModels(apiResults)
    : [];

  const switchTab = (tab: ACTIVE_TAB) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="tabs">
        <div
          className={`tab ${activeTab === ACTIVE_TAB.Results ? "active" : ""}`}
          onClick={() => switchTab(ACTIVE_TAB.Results)}
        >
          Results
        </div>
        <div
          className={`tab ${activeTab === ACTIVE_TAB.Issues ? "active" : ""}`}
          onClick={() => switchTab(ACTIVE_TAB.Issues)}
        >
          Issues
        </div>
      </div>

      <div className="content">
        {activeTab === ACTIVE_TAB.Results && (
          <Results
            results={modelledResults}
            filterParams={filterParams}
            setFilterParams={setFilterParams}
          />
        )}
        {activeTab === ACTIVE_TAB.Issues && <Issues />}
      </div>
    </>
  );
}

export default App;
