// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { defineSlotRecipe } from '@chakra-ui/react';

export const sliderRecipe = defineSlotRecipe({
  slots: ['root', 'control', 'track', 'range', 'thumb', 'markerGroup', 'marker', 'label', 'markerIndicator'],
  base: {
    track: {
      height: '6px',
      borderRadius: 'full',
      bg: {
        base: '#E0E0E0!',
        _dark: '#2D2D32!',
      },
    },
    range: {
      borderRadius: 'full',
      bg: {
        base: '#3054FE',
        _dark: '#53ABFC',
      },
    },
    thumb: {
      width: '20px',
      height: '20px',
      border: 'none',
      outline: 'none',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      bg: {
        base: '#FFFFFF',
        _dark: '#2D2D32',
      },
      _focus: {
        outline: 'none',
        ring: 'none',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
      _active: {
        transform: 'translateY(-50%) scale(1.15)',
      },
      _after: {
        content: '""',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        bg: {
          base: '#3054FE!',
          _dark: '#53ABFC!',
        },
      },
    },
    marker: {
      width: 2,
      height: 2,
      borderRadius: 'full',
      mt: '2px',
      top: '50%',
      transform: 'translateY(-50%)',
      bg: {
        base: '#F9FAFB!',
        _dark: '#333337!',
      },
    },
    markerIndicator: {
      display: 'none',
    },
  },
});
