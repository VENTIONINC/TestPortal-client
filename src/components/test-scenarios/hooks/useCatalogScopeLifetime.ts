// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useLayoutEffect, useRef } from 'react';

export const useCatalogScopeLifetime = (scopeKey: string) => {
  const lifetime = useRef<symbol | null>(null);

  useLayoutEffect(() => {
    lifetime.current = Symbol();
    return () => {
      lifetime.current = null;
    };
  }, [scopeKey]);

  return lifetime;
};
