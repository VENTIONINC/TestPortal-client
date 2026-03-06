import { useEffect, useRef, useState } from 'react';

interface UseFixedOnScrollOptions {
  top?: number;
}

interface FixedMetrics {
  left: number;
  width: number;
  height: number;
}

export const useFixedOnScroll = ({ top = 0 }: UseFixedOnScrollOptions = {}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isFixedRef = useRef(false);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedMetrics, setFixedMetrics] = useState<FixedMetrics>({ left: 0, width: 0, height: 0 });

  useEffect(() => {
    let metricsAnimationFrameId = 0;

    const syncMetrics = () => {
      const wrapperElement = wrapperRef.current;
      const contentElement = contentRef.current;

      if (!wrapperElement || !contentElement) {
        return;
      }

      const wrapperRect = wrapperElement.getBoundingClientRect();
      const contentHeight = Math.round(contentElement.getBoundingClientRect().height);
      const left = Math.round(wrapperRect.left);
      const width = Math.round(wrapperRect.width);

      setFixedMetrics((prev) => {
        const nextLeft = isFixedRef.current ? left : prev.left;
        const nextWidth = isFixedRef.current ? width : prev.width;

        if (prev.left === nextLeft && prev.width === nextWidth && prev.height === contentHeight) {
          return prev;
        }

        return { left: nextLeft, width: nextWidth, height: contentHeight };
      });
    };

    const evaluateFixedState = () => {
      const wrapperElement = wrapperRef.current;

      if (!wrapperElement) {
        return;
      }

      const wrapperTop = wrapperElement.getBoundingClientRect().top;
      const shouldBeFixed = wrapperTop <= top;

      if (isFixedRef.current === shouldBeFixed) {
        return;
      }

      isFixedRef.current = shouldBeFixed;
      setIsFixed(shouldBeFixed);

      if (shouldBeFixed) {
        syncMetrics();
      }
    };

    const scheduleMetricsSync = (includeStateEvaluation = false) => {
      if (metricsAnimationFrameId !== 0) {
        return;
      }

      metricsAnimationFrameId = requestAnimationFrame(() => {
        metricsAnimationFrameId = 0;

        if (includeStateEvaluation) {
          evaluateFixedState();
        }

        syncMetrics();
      });
    };

    const handleScroll = () => {
      // Scroll direction can change quickly; update fixed state in the same tick to avoid visual snap.
      evaluateFixedState();
    };

    const handleResize = () => {
      scheduleMetricsSync(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            scheduleMetricsSync(true);
          });

    if (resizeObserver) {
      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current);
      }

      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
    }

    scheduleMetricsSync(true);

    return () => {
      cancelAnimationFrame(metricsAnimationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      isFixedRef.current = false;
    };
  }, [top]);

  return {
    wrapperRef,
    contentRef,
    isFixed,
    fixedMetrics,
  };
};
