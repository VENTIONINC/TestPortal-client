import { useColorModeValue } from '@/components/ui';
import { status } from '@/theme/colors/status';

export const useSurfaceColors = () => {
  const surfaces = {
    page: useColorModeValue('gray.50', '#1C1C1E'),
    card: useColorModeValue('white', '#1C1C1E'),
    panel: useColorModeValue('gray.100', '#2C2C2E'),
    toolbar: useColorModeValue('gray.100', '#2C2C2E'),
    popover: useColorModeValue('white', '#1C1C1E'),
    shadow: useColorModeValue('blackAlpha.100', 'blackAlpha.400'),
    sidebar: useColorModeValue('#F6F6F7', '#26262B'),
  };
  const backgroundColor = {
    default: useColorModeValue('white', '#1C1C1E'),
    primary: useColorModeValue('#F6F6F7', '#26262B'),
    secondary: useColorModeValue('gray.100', '#2C2C2E'),
  };

  const borders = {
    subtle: useColorModeValue('#E0E0E0', '#3D3D3F'),
    default: useColorModeValue('#E0E0E0', '#3D3D3F'),
    focus: useColorModeValue('blue.500', 'blue.300'),
  };

  const text = {
    primary: useColorModeValue('#333333', '#EAEAEA'),
    secondary: useColorModeValue('#666666', '#B2B2B2'),
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
      icon: useColorModeValue('green.500', 'green.300'),
    },
    error: {
      bg: useColorModeValue('rgba(255, 69, 69, 0.1)', 'rgba(224, 53, 56, 0.1)'),
      text: useColorModeValue('#333333', '#EAEAEA'),
      border: 'transparent',
      borderRadius: '4px',
      icon: useColorModeValue('#FF4545', '#E03538'),
    },
    warning: {
      bg: useColorModeValue('yellow.50', 'yellow.900'),
      text: useColorModeValue('yellow.800', 'yellow.100'),
      border: useColorModeValue('yellow.300', 'yellow.700'),
      icon: useColorModeValue('yellow.500', 'yellow.300'),
    },
    info: {
      bg: useColorModeValue('blue.50', 'blue.900'),
      text: useColorModeValue('blue.700', 'blue.100'),
      border: useColorModeValue('blue.200', 'blue.700'),
      icon: useColorModeValue('blue.500', 'blue.300'),
    },
  };

  const nav = {
    item: {
      activeBg: useColorModeValue('rgba(20, 113, 235, 0.15)', 'rgba(90, 139, 255, 0.15)'),
      activeText: useColorModeValue('#3054FE', '#3054FE'),
      inactiveText: text.secondary,
      hoverBg: states.hoverSubtle,
    },
  };

  const badge = {
    info: {
      surface: {
        bg: status.info,
        color: status.info,
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue(status.info.value._light, status.info.value._dark),
        border: useColorModeValue(`1px solid ${status.info.value._light}`, `1px solid ${status.info.value._dark}`),
      },
      solid: {
        bg: useColorModeValue(status.info.value._light, status.info.value._dark),
        color: 'white',
        border: 'none',
      },
    },
    success: {
      surface: {
        bg: useColorModeValue(`${status.success.value._light}1A`, `${status.success.value._dark}1A`),
        color: useColorModeValue(status.success.value._light, status.success.value._dark),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue(status.success.value._light, status.success.value._dark),
        border: useColorModeValue(
          `1px solid ${status.success.value._light}`,
          `1px solid ${status.success.value._dark}`,
        ),
      },
      solid: {
        bg: useColorModeValue(status.success.value._light, status.success.value._dark),
        color: 'white',
        border: 'none',
      },
    },
    attention: {
      surface: {
        bg: useColorModeValue(`${status.attention.value._light}1A`, `${status.attention.value._dark}1A`), // Inferred from D8FE6A/BBEF4E
        color: useColorModeValue(status.attention.value._light, status.attention.value._dark),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue(status.attention.value._light, status.attention.value._dark),
        border: useColorModeValue(
          `1px solid ${status.attention.value._light}`,
          `1px solid ${status.attention.value._dark}`,
        ),
      },
      solid: {
        bg: useColorModeValue(status.attention.value._light, status.attention.value._dark),
        color: 'black', // Ensuring contrast for yellow/lime
        border: 'none',
      },
    },
    warning: {
      surface: {
        bg: useColorModeValue(`${status.warning.value._light}1A`, `${status.warning.value._dark}1A`), // Inferred from D8FE6A/BBEF4E
        color: useColorModeValue(status.warning.value._light, status.warning.value._dark),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue(status.warning.value._light, status.warning.value._dark),
        border: useColorModeValue(
          `1px solid ${status.warning.value._light}`,
          `1px solid ${status.warning.value._dark}`,
        ),
      },
      solid: {
        bg: useColorModeValue(status.warning.value._light, status.warning.value._dark),
        color: 'black', // Ensuring contrast for yellow/lime
        border: 'none',
      },
    },
    error: {
      surface: {
        bg: useColorModeValue(`${status.error.value._light}1A`, `${status.error.value._dark}1A`),
        color: useColorModeValue(status.error.value._light, status.error.value._dark),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue(status.error.value._light, status.error.value._dark),
        border: useColorModeValue(`1px solid ${status.error.value._light}`, `1px solid ${status.error.value._dark}`),
      },
      solid: {
        bg: useColorModeValue(status.error.value._light, status.error.value._dark),
        color: 'white',
        border: 'none',
      },
    },
    default: {
      surface: {
        bg: useColorModeValue(`${status.neutral.value._light}1A`, `${status.neutral.value._dark}1A`),
        color: useColorModeValue(status.neutral.value._light, status.neutral.value._dark),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue(status.neutral.value._light, status.neutral.value._dark),
        border: useColorModeValue(
          `1px solid ${status.neutral.value._light}`,
          `1px solid ${status.neutral.value._dark}`,
        ),
      },
      solid: {
        bg: useColorModeValue(status.neutral.value._light, status.neutral.value._dark),
        color: 'white',
        border: 'none',
      },
    },
  };

  const userCard = {
    bg: useColorModeValue('white', '#2D2D32'),
    avatarBg: useColorModeValue('rgba(20, 113, 235, 0.15)', 'rgba(90, 139, 255, 0.15)'),
    shadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
  };

  const menu = {
    bg: useColorModeValue('white', '#2D2D32'),
    border: useColorModeValue('#E0E0E0', '#3D3D3F'),
    shadow: useColorModeValue('0px 4px 8px rgba(0, 0, 0, 0.1)', '0px 4px 8px rgba(255, 255, 255, 0.1)'),
    itemHoverBg: useColorModeValue('rgba(20, 113, 235, 0.2)', 'rgba(90, 139, 255, 0.2)'),
    textPrimary: useColorModeValue('#333333', '#EAEAEA'),
    textSecondary: useColorModeValue('#B2B2B2', '#7A7A7A'),
    separator: useColorModeValue('#E0E0E0', '#3D3D3F'),
  };

  return {
    surfaces,
    borders,
    text,
    states,
    chips,
    alerts,
    nav,
    userCard,
    menu,
    badge,
    backgroundColor,
  };
};
