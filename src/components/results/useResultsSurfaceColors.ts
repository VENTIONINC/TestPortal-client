import { useSurfaceColors } from '@/theme';

export const useResultsSurfaceColors = () => {
  const { surfaces, borders, states, chips, text } = useSurfaceColors();

  const stats = {
    emptyText: text.muted,
    triggerHover: states.hoverSubtle,
    cardBg: surfaces.card,
    cardBorder: borders.subtle,
    strongText: text.primary,
    countText: text.muted,
  };

  return {
    controlsBg: surfaces.panel,
    controlsBorder: borders.subtle,
    toolbarBorder: borders.subtle,
    stats,
    chips,
  };
};
