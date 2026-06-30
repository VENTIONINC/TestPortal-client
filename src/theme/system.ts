// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { buttonRecipe, sliderRecipe, badgeRecipe, cardRecipe, tabsRecipe, linkRecipe } from './base';
import { semanticColors } from './colors';
import { shadows } from './shadows';
import { fontSizes, lineHeights, letterSpacings } from './typography';
import { fonts } from './fonts';

const config = defineConfig({
  globalCss: {
    'html, body': {
      bg: 'bg.page',
      fontFamily: 'body',
    },
  },
  theme: {
    tokens: {
      fonts,
      fontSizes,
      lineHeights,
      letterSpacings,
    },
    semanticTokens: {
      colors: semanticColors,
      shadows,
    },
    recipes: {
      button: buttonRecipe,
      badge: badgeRecipe,
      link: linkRecipe,
    },
    slotRecipes: {
      card: cardRecipe,
      tabs: tabsRecipe,
      slider: sliderRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
