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

  // Metric colors
  const issueColor = useColorModeValue('red.500', 'red.400');
  const executionColor = useColorModeValue('green.500', 'green.400');
  const specColor = useColorModeValue('blue.500', 'blue.400');

  const activeCardBg = useColorModeValue('white', 'gray.800');
  const inactiveCardBg = useColorModeValue('gray.50', 'gray.700');

  const activeBorder = useColorModeValue('gray.200', 'gray.600');
  const inactiveBorder = useColorModeValue('gray.300', 'gray.500');

  const activeTextColor = useColorModeValue('gray.900', 'white');
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.300');

  const activeDescriptionColor = useColorModeValue('gray.600', 'gray.300');
  const inactiveDescriptionColor = useColorModeValue('gray.500', 'gray.400');

  const activeMutedColor = useColorModeValue('gray.500', 'gray.400');
  const inactiveMutedColor = useColorModeValue('gray.400', 'gray.500');

  const cardHoverOrderColor = useColorModeValue('blue.200', 'blue.600');

  const activeOrderColor = useColorModeValue('blue.100', 'blue.900');
  const activeIconColor = useColorModeValue('blue.600', 'blue.300');

  const dividerColor = useColorModeValue('gray.100', 'gray.700');
  return {
    dividerColor,
    cardBg: isActive ? activeCardBg : inactiveCardBg,
    cardBorder: isActive ? activeBorder : inactiveBorder,
    textColor: isActive ? activeTextColor : inactiveTextColor,
    descriptionColor: isActive ? activeDescriptionColor : inactiveDescriptionColor,
    mutedTextColor: isActive ? activeMutedColor : inactiveMutedColor,
    cardHoverOrderColor,
    hoverShadow,
    gradientBg,
    issueColor,
    executionColor,
    specColor,
    activeOrderColor,
    activeIconColor,
    inactiveTextColor,
  };
}
