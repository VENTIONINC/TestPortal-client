import { act } from 'react';

export const button = {
  primary: {
    bg: {
      default: { value: { _light: '#3054FE', _dark: '#3054FE' } },
      hover: { value: { _light: '#4565FE', _dark: '#4565FE' } },
      focus: { value: { _light: '#2745CF', _dark: '#2745CF' } },
      disabled: { value: { _light: '#8398FE', _dark: '#8398FE' } },
    },
    color: {
      value: {
        _light: '#EAEAEA',
        _dark: '#FFFFFF',
      },
    },
  },
  secondary: {
    bg: {
      default: { value: { _light: '#F4F4F5', _dark: '#18181B' } },
      hover: { value: { _light: '#E4E4E7', _dark: '#19191D' } },
      focus: { value: { _light: '#F4F4F5', _dark: '#18181B' } },
      disabled: { value: { _light: '#F0F0F0', _dark: '#2A2A2D' } },
      active: { value: { _light: 'rgba(20, 113, 235, 0.15)', _dark: 'rgba(20, 113, 235, 0.15)' } },
    },
    color: {
      value: {
        _light: '#333333',
        _dark: '#FFFFFF',
      },
    },
    disabledColor: {
      value: {
        _light: '#B2B2B2',
        _dark: '#7A7A7A',
      },
    },
    borderActiveColor: {
      value: {
        _light: '#1471EB',
        _dark: '#5A88FF',
      },
    },
  },
  tertiary: {
    color: {
      value: {
        _light: '#333333',
        _dark: '#EAEAEA',
      },
    },
    borderColor: {
      value: {
        _light: '#E0E0E0',
        _dark: '#3D3D3F',
      },
    },

    default: { value: { _light: 'transparent', _dark: 'transparent' } },
    bg: {
      default: { value: 'transparent' },
      hover: {
        value: {
          _light: 'rgba(20, 113, 235, 0.2)',
          _dark: 'rgba(90, 139, 255, 0.2)',
        },
      },
      focus: {
        value: {
          _light: 'rgba(20, 113, 235, 0.15)',
          _dark: 'rgba(90, 139, 255, 0.15)',
        },
      },
      disabled: { value: 'transparent' },
    },
    borderColorFocus: {
      value: {
        _light: '#1471EB',
        _dark: '#5A88FF',
      },
    },
  },

  borderLess: {
    color: {
      value: {
        _light: '#3054FE',
        _dark: '#3054FE',
      },
    },
    default: { value: { _light: '#3054FE', _dark: '#3054FE' } },
    hover: {
      value: {
        _light: 'rgba (20, 113, 235, 0.2)',
        _dark: 'rgba (90, 139, 255, 0.2)',
      },
    },
    focus: { value: { _light: '#1471EB', _dark: '#5A88FF' } },
    disabled: { value: { _light: '#8398FE', _dark: '#8398FE' } },
  },
  primaryError: {
    default: { value: { _light: '#DC2626', _dark: '#DC2626' } },
    hover: { value: { _light: '#FF4545', _dark: '#FF4545' } },
    focus: { value: { _light: '#CC2829', _dark: '#CC2829' } },
    disabled: { value: { _light: '#EA7D7D', _dark: '#EA7D7D' } },
  },
  secondaryError: {
    bgDefault: {
      value: {
        _light: 'rgba (187, 37, 26, 0.05)',
        _dark: 'rgba (187, 37, 26, 0.05)',
      },
    },
    titleDefault: {
      value: {
        _light: '#DC2626',
        _dark: '#DC2626',
      },
    },
    bgHoverDefault: {
      value: {
        _light: 'rgba (255, 69, 69, 0.2)',
        _dark: 'rgba (255, 69, 69, 0.2)',
      },
    },
    titleHover: {
      value: {
        _light: '#DC2626',
        _dark: '#DC2626',
      },
    },
    focus: {
      value: {
        _light: 'rgba (187, 37, 26, 0.15)',
        _dark: 'rgba (187, 37, 26, 0.15)',
      },
    },
    titleDisabled: {
      value: {
        _light: '#EA7D7D',
        _dark: '#EA7D7D',
      },
    },
    bgDisable: {
      value: {
        _light: 'rgba (234, 125, 125, 0.05)',
        _dark: 'rgba (234, 125, 125, 0.05)',
      },
    },
  },

  bgFocusDefault: {
    hover: {
      value: {
        _light: 'rgba(255, 69, 69, 0.2)',
        _dark: 'rgba(255, 69, 69, 0.2)',
      },
    },
    focus: {
      value: {
        _light: 'rgba(187, 37, 26, 0.15)',
        _dark: 'rgba(187, 37, 26, 0.15)',
      },
    },
    disabled: {
      value: {
        _light: 'rgba(234, 125, 125, 0.05)',
        _dark: 'rgba(234, 125, 125, 0.05)',
      },
    },
  },
};
