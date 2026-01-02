import { useColorModeValue } from '@/components/ui';

export const useSurfaceColors = () => {
  const surfaces = {
    page: useColorModeValue('gray.50', 'gray.900'),
    card: useColorModeValue('white', 'gray.900'),
    panel: useColorModeValue('gray.100', 'gray.800'),
    toolbar: useColorModeValue('gray.100', 'gray.800'),
    popover: useColorModeValue('white', 'gray.900'),
    shadow: useColorModeValue('blackAlpha.100', 'blackAlpha.400'),
  };

  const borders = {
    subtle: useColorModeValue('gray.200', 'gray.700'),
    default: useColorModeValue('gray.200', 'gray.700'),
    focus: useColorModeValue('blue.500', 'blue.300'),
  };

  const text = {
    primary: useColorModeValue('gray.900', 'gray.50'),
    muted: useColorModeValue('gray.600', 'gray.300'),
    inverted: useColorModeValue('white', 'gray.900'),
    link: useColorModeValue('blue.600', 'blue.300'),
  };

  const states = {
    hoverSubtle: useColorModeValue('gray.200', 'gray.700'),
    hoverStrong: useColorModeValue('gray.700', 'gray.200'),
    selected: useColorModeValue('gray.800', 'gray.100'),
  };

  const chips = {
    activeBg: states.selected,
    activeText: useColorModeValue('white', 'gray.900'),
    inactiveBg: surfaces.card,
    inactiveText: text.primary,
    hoverActiveBg: states.hoverStrong,
    hoverInactiveBg: states.hoverSubtle,
    border: borders.subtle,
  };

  const alerts = {
    success: {
      bg: useColorModeValue('green.50', 'green.900'),
      text: useColorModeValue('green.700', 'green.100'),
      border: useColorModeValue('green.200', 'green.700'),
    },
    error: {
      bg: useColorModeValue('red.50', 'red.900'),
      text: useColorModeValue('red.700', 'red.100'),
      border: useColorModeValue('red.200', 'red.700'),
    },
    warning: {
      bg: useColorModeValue('yellow.50', 'yellow.900'),
      text: useColorModeValue('yellow.800', 'yellow.100'),
      border: useColorModeValue('yellow.300', 'yellow.700'),
    },
    info: {
      bg: useColorModeValue('blue.50', 'blue.900'),
      text: useColorModeValue('blue.700', 'blue.100'),
      border: useColorModeValue('blue.200', 'blue.700'),
    },
  };

  return {
    surfaces,
    borders,
    text,
    states,
    chips,
    alerts,
  };
};
