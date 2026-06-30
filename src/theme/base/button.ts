// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        bg: 'button.primary.bg.default',
        p: '10px',
        color: 'button.primary.color',
        _hover: {
          bg: 'button.primary.bg.hover',
          boxShadow: 'button.primary.shadow',
          borderRadius: '4px',
        },
        _focus: {
          bg: 'button.primary.bg.focus',
        },

        _active: {
          bg: 'button.primary.bg.focus',
        },
        _invalid: {
          bg: 'button.primaryError.default',
          _hover: {
            bg: 'button.primaryError.hover',
          },
          _active: {
            bg: 'button.primaryError.focus',
          },
        },
        _disabled: {
          bg: 'button.primary.bg.disabled',
          opacity: 1,
          _hover: {
            bg: 'button.primary.bg.disabled',
            // _dark: {
            //   bg: 'button.primary.bg.disabled',
            // },
          },
          //   _dark: {
          //     bg: 'button.primary.bg.disabled',
          //   },
        },
        _loading: {
          bg: 'button.primary.bg.disabled',
          width: '52px',
          _hover: {
            bg: 'button.primary.bg.disabled',
          },
        },
      },
      secondary: {
        bg: 'button.secondary.bg.default',
        borderWidth: '1px',
        borderColor: 'button.secondary.disabledColor',
        color: 'button.secondary.color',
        _hover: {
          bg: 'button.secondary.bg.hover',
        },
        _active: {
          bg: 'button.secondary.bg.active',
          borderColor: 'button.secondary.borderActiveColor',
        },
        _expanded: {
          bg: 'button.secondary.bg.active',
        },
        // // For FilterToggleButton or other custom active states
        // '&[data-active]': {
        //   bg: { value: '{colors.button.secondary.bg.active}' },
        // },
        _disabled: {
          opacity: 1,
          bg: 'button.secondary.bg.disabled',
          color: 'button.secondary.disabledColor',
          borderColor: 'button.secondary.disabledColor',
        },
        _loading: {
          bg: 'button.secondary.bg.disabled',
          color: 'button.secondary.disabledColor',
          borderColor: 'button.secondary.disabledColor',
          width: '52px',
        },
      },
      tertiary: {
        bg: 'transparent',
        color: 'button.tertiary.color',
        borderColor: 'button.tertiary.borderColor',
        borderWidth: '1px',
        borderStyle: 'solid',
        _hover: {
          bg: 'button.tertiary.bg.hover',
        },
        _focus: {
          bg: 'button.tertiary.bg.focus',
          borderColor: 'button.tertiary.borderColorFocus',
        },
        _active: {
          bg: 'button.tertiary.bg.active',
        },
        _disabled: {
          opacity: 1,
          color: 'button.tertiary.disabledColor',
          bg: 'transparent',
        },
        _loading: {
          color: 'button.tertiary.disabledColor',
          bg: 'transparent',
          width: '52px',
        },
      },
      primaryError: {
        bg: 'button.primaryError.default',
        p: '10px',
        color: 'button.primary.color',
        _hover: {
          bg: 'button.primaryError.hover',
        },
        _active: {
          bg: 'button.primaryError.focus',
        },
        _disabled: {
          bg: 'button.primaryError.disabled',
          opacity: 1,
        },
      },
      secondaryError: {
        bg: 'button.secondaryError.bgDefault',
        borderWidth: '1px',
        borderColor: 'button.secondaryError.titleDefault',
        color: 'button.secondaryError.titleDefault',
        _hover: {
          bg: 'button.secondaryError.bgHoverDefault',
        },
        _active: {
          bg: 'button.secondaryError.focus',
        },
        _disabled: {
          opacity: 1,
          bg: 'button.secondaryError.bgDisable',
          color: 'button.secondaryError.titleDisabled',
          borderColor: 'button.secondaryError.titleDisabled',
        },
      },
    },
    size: {
      xs: {
        h: '6',
        minW: '6',
        fontSize: 'xs',
        px: '2',
      },
      sm: {
        h: '8',
        minW: '8',
        fontSize: 'sm',
        px: '3',
      },
      md: {
        h: '10',
        minW: '10',
        fontSize: 'md',
        px: '4',
      },
      lg: {
        h: '12',
        minW: '12',
        fontSize: 'lg',
        px: '6',
      },
    },
  },
  //   defaultVariants: {
  //     variant: 'solid',
  //     size: 'md',
  //     colorPalette: 'blue',
  //   },
});
