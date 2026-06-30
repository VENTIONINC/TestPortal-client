// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useGetApiV2StatusQuery, useGetApiV2UsersByUserIdQuery } from '@/redux/apis/generatedApi';
import type { RootState } from '@/redux/store';
import { LoadingPlaceholder } from '@/components/ui/LoadingPlaceholder';

interface AppGuardProps {
  children: ReactNode;
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

export function AppGuard({ children }: AppGuardProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { isError: isStatusError } = useGetApiV2StatusQuery();

  if (isStatusError) {
    throw new Error("Server isn't available");
  }

  const userId = accessToken ? getUserIdFromToken(accessToken) : null;

  const { isLoading: isUserLoading, isError } = useGetApiV2UsersByUserIdQuery(
    { userId: userId! },
    {
      skip: !accessToken || !userId || !isAuthenticated,
      refetchOnMountOrArgChange: false,
    },
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setIsInitialized(true);
      return;
    }

    if (!isUserLoading && !isError) {
      setIsInitialized(true);
    }
  }, [isAuthenticated, accessToken, isUserLoading, isError]);

  if (!isInitialized) {
    return <LoadingPlaceholder />;
  }

  return <>{children}</>;
}
