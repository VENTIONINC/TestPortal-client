import { useLayoutEffect, useRef, useState } from 'react';

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

  useLayoutEffect(() => {
    let metricsAnimationFrameId = 0;

    const syncMetrics = () => {
      const wrapperElement = wrapperRef.current;
      const contentElement = contentRef.current;

      if (!wrapperElement || !contentElement) {
        return;
      }

      const wrapperRect = wrapperElement.getBoundingClientRect();
      const contentHeight = contentElement.getBoundingClientRect().height;
      const left = wrapperRect.left;
      const width = wrapperRect.width;

      setFixedMetrics((prev) => {
        if (prev.left === left && prev.width === width && prev.height === contentHeight) {
          return prev;
        }

        return { left, width, height: contentHeight };
      });
    };

    const evaluateFixedState = () => {
      const wrapperElement = wrapperRef.current;

      if (!wrapperElement) {
        return;
      }

      const nextIsFixed = wrapperElement.getBoundingClientRect().top <= top;

      if (isFixedRef.current === nextIsFixed) {
        return;
      }

      isFixedRef.current = nextIsFixed;
      setIsFixed(nextIsFixed);

      if (nextIsFixed) {
        syncMetrics();
      }
    };

    const scheduleMetricsSync = () => {
      if (metricsAnimationFrameId !== 0) {
        return;
      }

      metricsAnimationFrameId = requestAnimationFrame(() => {
        metricsAnimationFrameId = 0;
        syncMetrics();
      });
    };

    const handleScroll = () => {
      evaluateFixedState();
    };

    const handleResize = () => {
      evaluateFixedState();
      scheduleMetricsSync();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            evaluateFixedState();
            scheduleMetricsSync();
          });

    if (resizeObserver) {
      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current);
      }

      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
    }

    syncMetrics();
    evaluateFixedState();

    return () => {
      cancelAnimationFrame(metricsAnimationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [top]);

  return {
    wrapperRef,
    contentRef,
    isFixed,
    fixedMetrics,
  };
};
