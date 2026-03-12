import { useColorModeValue } from '@/components/ui';

export function useProjectCardColors(isActive: boolean) {
  const gradientBg = useColorModeValue(
    'linear(to-br, blue.50, indigo.50, purple.50)',
    'linear(to-br, rgba(66, 153, 225, 0.1), rgba(102, 126, 234, 0.1), rgba(159, 122, 234, 0.1))',
  );
  const hoverShadow = 'shadow.md';

  const activeTextColor = 'text.main';
  const inactiveTextColor = 'text.secondary';

  const activeDescriptionColor = 'text.secondary';
  const inactiveDescriptionColor = 'text.muted';

  const cardHoverOrderColor = 'border.active';

  return {
    textColor: isActive ? activeTextColor : inactiveTextColor,
    descriptionColor: isActive ? activeDescriptionColor : inactiveDescriptionColor,

    cardHoverOrderColor,
    hoverShadow,
    gradientBg,

    inactiveTextColor,
  };
}
