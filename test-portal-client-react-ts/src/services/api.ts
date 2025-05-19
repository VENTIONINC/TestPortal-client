import type { FilterParamsState } from '../hooks/useFilterParams';
// We'll also need the actual Result type from models.ts later
// For now, let's assume the API returns an array of 'any'
// import { Result } from '../utils/models'; // Placeholder for actual Result type

// Updated ApiResult based on toMaps.svelte.js structure
export interface ApiResult {
  spec: { id: string | number; [key: string]: any };
  execution: { id: string | number; [key: string]: any };
  errors?: Array<{
    assumptions?: Array<{
      issue: { id: string | number; [key: string]: any };
      [key: string]: any; // Other assumption properties
    }>;
    [key: string]: any; // Other error properties
  }>;
  // ... plus other properties that form the main Result object (e.g., startTime)
  [key: string]: any; // For remaining properties that go into ResultData
}

export const fetchResults = async (
  filters: FilterParamsState
): Promise<ApiResult[]> => {
  // Create URLSearchParams from the filters object
  // Only include relevant filter params for the API call
  const queryParams = new URLSearchParams();

  // Example: only 'from' and 'to' were used in Svelte version, plus potentially others from FilterParamsState
  if (filters.from) queryParams.append('from', filters.from);
  if (filters.to) queryParams.append('to', filters.to);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.tag) queryParams.append('tag', filters.tag);
  if (filters.specId) queryParams.append('specId', filters.specId);
  // Add other filters as needed by your API
  if (filters.page) queryParams.append('page', filters.page.toString());

  const response = await fetch(
    `http://localhost:3001/api/results?${queryParams.toString()}`
  );

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse error response json:', parseError);
      errorData = {
        message: 'Failed to parse error response json from server.',
      };
    }
    throw new Error(
      `Unable to load results: ${response.status} ${JSON.stringify(
        errorData,
        null,
        2
      )}`
    );
  }

  const data = await response.json();
  // Assuming the API returns an object like { results: [...] } as in Svelte version
  // If API returns the array directly, use: return data;
  return data.results || []; // Ensure it returns an array
};
