// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useGetApiV2PromptsQuery } from '@/redux/apis/generatedApi';

export const usePromptGallery = () => {
  const { data, isFetching, error } = useGetApiV2PromptsQuery();
  return { data, isFetching, error };
};
