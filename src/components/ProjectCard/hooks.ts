import { useColorModeValue } from '@/components/ui';

export function useProjectCardColors(isActive: boolean) {
  const gradientBg = useColorModeValue(
    'linear(to-br, blue.50, indigo.50, purple.50)',
    'linear(to-br, blue.900, indigo.900, purple.900)',
  );
  const hoverShadow = useColorModeValue(
    '0 8px 25px -5px rgba(0,0,0,0.1), 0 8px 16px -8px rgba(0,0,0,0.1)',
    '0 8px 25px -5px rgba(0,0,0,0.4), 0 8px 16px -8px rgba(0,0,0,0.3)',
  );

  const activeTextColor = useColorModeValue('gray.900', 'white');
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.300');

  const activeDescriptionColor = useColorModeValue('gray.600', 'gray.300');
  const inactiveDescriptionColor = useColorModeValue('gray.500', 'gray.400');

  const cardHoverOrderColor = useColorModeValue('blue.200', 'blue.600');

  return {
    textColor: isActive ? activeTextColor : inactiveTextColor,
    descriptionColor: isActive ? activeDescriptionColor : inactiveDescriptionColor,

    cardHoverOrderColor,
    hoverShadow,
    gradientBg,

    inactiveTextColor,
  };
}
