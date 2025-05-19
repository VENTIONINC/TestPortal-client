import { useQuery } from '@tanstack/react-query';
import { fetchResults } from '../services/api';
import type { ApiResult } from '../services/api'; // Type-only import
import type { FilterParamsState } from './useFilterParams';
// We would ideally import the actual Result class/type from models.ts here later
// import { Result } from '../utils/models';

export const useResultsQuery = (filters: FilterParamsState) => {
  return useQuery<ApiResult[], Error>({
    // Using ApiResult[] for now
    queryKey: ['results', filters], // Query key includes filters
    queryFn: () => fetchResults(filters),
    // We can add other options like `staleTime`, `cacheTime`, `enabled`, etc.
    // For example, keep data fresh for 5 minutes:
    // staleTime: 5 * 60 * 1000,
  });
};
