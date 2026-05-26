// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { defineSlotRecipe } from '@chakra-ui/react';

export const cardRecipe = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'footer'],
  base: {
    // root: {
    //   display: 'flex',
    //   flexDirection: 'column',
    //   bg: 'bg.card',
    //
    //   borderWidth: '1px',
    //   borderColor: 'border.default',
    // },
    root: {
      borderRadius: 'xl',
    },
    header: {
      pt: '15px',
      pl: '15px',
    },
    body: {
      // p: '15px 16px',
      // flex: '1',
    },
    // footer: {
    //   p: '6',
    // },
  },
  variants: {
    variant: {
      elevated: {
        root: {
          bg: 'bg.card',
          boxShadow: 'sm',
          borderWidth: '0',
        },
      },
      outline: {
        root: {
          borderWidth: '1px',
          borderColor: 'border.default',
          boxShadow: 'none',
          bg: 'bg.card',
        },
      },
      filled: {
        root: {
          // bg: 'bg.subtle',
          boxShadow: 'none',
          // bg: 'bg.card',
        },
      },
    },
  },
  // defaultVariants: {
  //   variant: 'outline',
  // },
});
