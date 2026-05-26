// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { defineSlotRecipe } from '@chakra-ui/react';

export const tabsRecipe = defineSlotRecipe({
  slots: ['root', 'list', 'trigger', 'content', 'indicator'],

  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      color: 'tabs.main',
      fontFamily: 'Aeonik Pro',
      fontWeight: 500,
      fontStyle: 'Medium',
      fontSize: '18px',
      lineHeight: '26px',
      letterSpacing: '0%',
      verticalAlign: 'middle',
    },
    list: {
      //   display: 'flex',
      //   borderBottomWidth: '1px',
      //   borderColor: 'border.default',
      //   gap: '0',
      color: 'tabs.main',
    },
    trigger: {
      //   px: '4',
      //   py: '3',
      //   fontSize: 'sm',
      //   fontWeight: 'medium',
      color: 'tabs.main',
      //   cursor: 'pointer',
      //   borderBottomWidth: '2px',
      //   borderBottomColor: 'transparent',
      //   transition: 'all 0.2s',
      _hover: {
        color: 'tabs.active',
        // bg: 'bg.subtle',
      },
      _selected: {
        color: 'tabs.active',
        fontSize: '18px',
        lineHeight: '26px',
        borderBottomColor: 'tabs.active',
        // color: 'colorPalette.fg',
        // borderBottomColor: 'colorPalette.solid',
      },
      _disabled: {
        // opacity: 0.4,
        // cursor: 'not-allowed',
      },
    },
    content: {
      py: '4',
    },
    indicator: {
      //   height: '2px',
      //   bg: 'colorPalette.solid',
      //   transition: 'all 0.2s',
    },
  },
  variants: {
    variant: {
      line: {
        list: {
          borderBottomWidth: '1px',
          borderColor: 'border.default',
        },
        trigger: {
          borderBottomWidth: '2px',
          fontSize: '18px',
          lineHeight: '26px',
          color: 'tabs.main',
          _selected: {
            color: 'tabs.active',
            borderBottomColor: 'tabs.active',
          },
        },
      },
      enclosed: {
        list: {
          borderBottomWidth: '1px',
          borderColor: 'border.default',
        },
        trigger: {
          borderWidth: '1px',
          borderColor: 'transparent',
          borderBottomColor: 'border.default',
          mb: '-1px',
          _selected: {
            borderColor: 'border.default',
            borderBottomColor: 'transparent',
            bg: 'bg.panel',
          },
        },
      },
      soft: {
        trigger: {
          borderRadius: 'md',
          _selected: {
            bg: 'colorPalette.subtle',
            color: 'colorPalette.fg',
          },
        },
      },
    },
    // size: {
    //   sm: {
    //     trigger: {
    //       px: '3',
    //       py: '2',
    //       fontSize: 'xs',
    //     },
    //   },
    //   md: {
    //     trigger: {
    //       px: '4',
    //       py: '3',
    //       fontSize: 'sm',
    //     },
    //   },
    //   lg: {
    //     trigger: {
    //       px: '5',
    //       py: '4',
    //       fontSize: 'md',
    //     },
    //   },
    // },
  },
  //   defaultVariants: {
  //     variant: 'line',
  //     size: 'md',
  //   },
});
