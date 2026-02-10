import { useEffect, useRef, useState, type RefObject } from 'react';

type FixedPosition = 'static' | 'fixed';

type FixedOnScrollOptions = {
  topOffset?: number;
  bottomOffset?: number;
  deps?: unknown[];
};

type FixedOnScrollResult = {
  sectionRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  placeholderMinHeight?: string;
  position: FixedPosition;
  top?: string;
  left?: string;
  width?: string;
  zIndex: number;
  transform?: string;
};

export const useFixedOnScroll = ({
  topOffset = 12,
  bottomOffset = 24,
  deps = [],
}: FixedOnScrollOptions = {}): FixedOnScrollResult => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<FixedPosition>('static');
  const [translateY, setTranslateY] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState({
    left: 0,
    width: 0,
    height: 0,
    startY: 0,
    sectionStartY: 0,
    endY: 0,
  });

  const measure = () => {
    if (!containerRef.current || !sectionRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sectionRect = sectionRef.current.getBoundingClientRect();
    setMetrics({
      left: rect.left,
      width: rect.width,
      height: rect.height,
      startY: rect.top + window.scrollY,
      sectionStartY: sectionRect.top + window.scrollY,
      endY: sectionRect.bottom + window.scrollY,
    });
    setIsReady(true);
  };

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, deps);

  useEffect(() => {
    const onScroll = () => {
      if (!isReady) return;
      const currentTop = window.scrollY + topOffset;
      const maxFixedTop = metrics.endY - metrics.height - bottomOffset;
      const desiredTop = Math.min(Math.max(metrics.startY, currentTop), maxFixedTop);
      setPosition('fixed');
      setTranslateY(desiredTop - currentTop);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [metrics, topOffset, bottomOffset, isReady]);

  return {
    sectionRef,
    containerRef,
    placeholderMinHeight: isReady ? `${metrics.height}px` : undefined,
    position: isReady ? position : 'static',
    top: isReady ? `${topOffset}px` : undefined,
    left: isReady ? `${metrics.left}px` : undefined,
    width: isReady ? `${metrics.width}px` : '100%',
    zIndex: isReady ? 10 : 1,
    transform: isReady ? `translateY(${translateY}px)` : undefined,
  };
};
