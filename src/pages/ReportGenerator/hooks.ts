import { useColorModeValue } from '@/components/ui';

export const useReportGeneratorColors = () => {
  return {
    card: {
      bg: useColorModeValue('white', 'gray.800'),
      border: useColorModeValue('gray.200', 'gray.700'),
    },
    surface: {
      bg: useColorModeValue('gray.50', 'gray.700'),
      border: useColorModeValue('gray.200', 'gray.600'),
    },
    nestedSurface: {
      bg: useColorModeValue('gray.100', 'gray.800'),
      border: useColorModeValue('gray.300', 'gray.600'),
    },
    passed: {
      bg: useColorModeValue('green.50', 'green.900'),
      border: useColorModeValue('green.200', 'green.700'),
      text: useColorModeValue('green.700', 'green.300'),
      label: useColorModeValue('green.600', 'green.400'),
    },
    failed: {
      bg: useColorModeValue('red.50', 'red.900'),
      border: useColorModeValue('red.200', 'red.700'),
      text: useColorModeValue('red.700', 'red.300'),
      label: useColorModeValue('red.600', 'red.400'),
    },
    timedOut: {
      bg: useColorModeValue('yellow.50', 'yellow.900'),
      border: useColorModeValue('yellow.200', 'yellow.700'),
      text: useColorModeValue('yellow.700', 'yellow.300'),
      label: useColorModeValue('yellow.600', 'yellow.400'),
    },
    total: {
      bg: useColorModeValue('blue.50', 'blue.900'),
      border: useColorModeValue('blue.200', 'blue.700'),
      text: useColorModeValue('blue.700', 'blue.300'),
      label: useColorModeValue('blue.600', 'blue.400'),
    },
  };
};
