// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { defineRecipe } from '@chakra-ui/react';

export const badgeRecipe = defineRecipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    px: '8px',
    py: '4px',
    textTransform: 'none',
    fontSize: 'xs',
    fontWeight: 'medium',
    lineHeight: '1.2',
  },
  variants: {
    variant: {
      solid: {},
      outline: {
        bg: 'transparent',
      },
      surface: {
        border: 'none',
      },
    },
    status: {
      info: { colorPalette: 'status.info' },
      success: { colorPalette: 'status.success' },
      warning: { colorPalette: 'status.warning' },
      error: { colorPalette: 'status.error' },
      attention: { colorPalette: 'status.attention' },
      default: { colorPalette: 'status.neutral' },
    },
  },
  compoundVariants: [
    // Info
    {
      variant: 'solid',
      status: 'info',
      css: { bg: 'status.info', color: 'status.textColor' },
    },
    {
      variant: 'outline',
      status: 'info',
      css: {
        border: '1px solid',
        borderColor: 'status.info',
        color: 'status.textColor',
      },
    },
    {
      variant: 'surface',
      status: 'info',
      css: {
        bg: 'status.info',
        color: 'status.textColor',
      },
    },

    // Success
    {
      variant: 'solid',
      status: 'success',
      css: { bg: 'status.success', color: 'status.textColor' },
    },
    {
      variant: 'outline',
      status: 'success',
      css: {
        border: '1px solid',
        borderColor: 'status.success',
        color: 'status.success',
      },
    },
    {
      variant: 'surface',
      status: 'success',
      css: {
        bg: 'status.success',
        color: 'status.textColor',
      },
    },

    // Warning
    {
      variant: 'solid',
      status: 'warning',
      css: { bg: 'status.warning', color: 'status.textColor' },
    },
    {
      variant: 'outline',
      status: 'warning',
      css: {
        border: '1px solid',
        borderColor: 'status.warning',
        color: 'status.textColor',
      },
    },
    {
      variant: 'surface',
      status: 'warning',
      css: {
        bg: 'status.warning',
        color: 'status.textColor',
      },
    },

    // Error
    {
      variant: 'solid',
      status: 'error',
      css: { bg: 'status.error', color: 'status.textColor' },
    },
    {
      variant: 'outline',
      status: 'error',
      css: {
        border: '1px solid',
        borderColor: 'status.error',
        color: 'status.textColor',
      },
    },
    {
      variant: 'surface',
      status: 'error',
      css: {
        bg: 'status.error',
        color: 'status.textColor',
      },
    },

    // Attention
    {
      variant: 'solid',
      status: 'attention',
      css: { bg: 'status.attention', color: 'status.textColor' },
    },
    {
      variant: 'outline',
      status: 'attention',
      css: {
        border: '1px solid',
        borderColor: 'status.attention',
        color: 'status.textColor',
      },
    },
    {
      variant: 'surface',
      status: 'attention',
      css: {
        bg: 'status.attention',
        color: 'status.textColor',
      },
    },

    // Default (Neutral)
    {
      variant: 'solid',
      status: 'default',
      css: { bg: 'status.neutral', color: 'status.textColor' },
    },
    {
      variant: 'outline',
      status: 'default',
      css: {
        border: '1px solid',
        borderColor: 'status.neutral',
        color: 'status.textColor',
      },
    },
    {
      variant: 'surface',
      status: 'default',
      css: {
        bg: 'status.neutral',
        color: 'status.textColor',
      },
    },
  ],
  defaultVariants: {
    variant: 'surface',
    status: 'default',
  },
});
