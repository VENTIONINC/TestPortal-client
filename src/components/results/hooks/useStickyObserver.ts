// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';

/**
 * Uses IntersectionObserver on a sentinel element to detect
 * when the sticky header becomes "stuck" (scrolled past its natural position).
 */
export const useStickyObserver = (topOffset = 66) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      {
        rootMargin: `-${topOffset}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [topOffset]);

  return { sentinelRef, isStuck };
};
