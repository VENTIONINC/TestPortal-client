import { useState } from "react";

import { IssueFilters } from "@/types";

export const useIssueFilters = () => {
  const [filters, setFilters] = useState<IssueFilters>({
    tag: "",
    specId: undefined,
    specFile: "",
    specName: "",
    environment: "",
    type: "",
    category: "",
    name: "",
    fromDate: "",
    toDate: "",
    page: 1,
  });

  const updateFilters = (newFilters: Partial<IssueFilters>) => {
    setFilters((current) => ({ ...current, ...newFilters }));
  };

  return { filters, updateFilters };
};
