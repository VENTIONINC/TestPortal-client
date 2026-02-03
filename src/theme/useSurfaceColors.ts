import { useColorModeValue } from '@/components/ui';

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
        bg: useColorModeValue('#6EC8FF1A', '#3AA9FF1A'),
        color: useColorModeValue('#6EC8FF', '#3AA9FF'),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue('#6EC8FF', '#3AA9FF'),
        border: useColorModeValue('1px solid #6EC8FF', '1px solid #3AA9FF'),
      },
      solid: {
        bg: useColorModeValue('#6EC8FF', '#3AA9FF'),
        color: 'white',
        border: 'none',
      },
    },
    success: {
      surface: {
        bg: useColorModeValue('#5AF87A1A', '#2CD9581A'),
        color: useColorModeValue('#1FE647', '#2CD958'),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue('#1FE647', '#2CD958'),
        border: useColorModeValue('1px solid #1FE647', '1px solid #2CD958'),
      },
      solid: {
        bg: useColorModeValue('#1FE647', '#2CD958'),
        color: 'white',
        border: 'none',
      },
    },
    attention: {
      surface: {
        bg: useColorModeValue('#D8FE6A1A', '#BBEF4E1A'), // Inferred from D8FE6A/BBEF4E
        color: useColorModeValue('#C3F532', '#BBEF4E'),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue('#C3F532', '#BBEF4E'),
        border: useColorModeValue('1px solid #C3F532', '1px solid #BBEF4E'),
      },
      solid: {
        bg: useColorModeValue('#C3F532', '#BBEF4E'),
        color: 'black', // Ensuring contrast for yellow/lime
        border: 'none',
      },
    },
    warning: {
      surface: {
        bg: useColorModeValue('#FF874D1A', '##E69A2D1A'), // Inferred from D8FE6A/BBEF4E
        color: useColorModeValue('#C3F532', '#BBEF4E'),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue('#C3F532', '#BBEF4E'),
        border: useColorModeValue('1px solid #C3F532', '1px solid #BBEF4E'),
      },
      solid: {
        bg: useColorModeValue('#C3F532', '#BBEF4E'),
        color: 'black', // Ensuring contrast for yellow/lime
        border: 'none',
      },
    },
    error: {
      surface: {
        bg: useColorModeValue('#FF45451A', '#E035381A'),
        color: useColorModeValue('#FF4545', '#E03538'),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue('#FF4545', '#E03538'),
        border: useColorModeValue('1px solid #FF4545', '1px solid #E03538'),
      },
      solid: {
        bg: useColorModeValue('#FF4545', '#E03538'),
        color: 'white',
        border: 'none',
      },
    },
    default: {
      surface: {
        bg: useColorModeValue('#B2B2B21A', '#7D7D7F1A'),
        color: useColorModeValue('#B2B2B2', '#7D7D7F'),
        border: 'none',
      },
      outline: {
        bg: 'transparent',
        color: useColorModeValue('#B2B2B2', '#7D7D7F'),
        border: useColorModeValue('1px solid #B2B2B2', '1px solid #7D7D7F'),
      },
      solid: {
        bg: useColorModeValue('#B2B2B2', '#7D7D7F'),
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
