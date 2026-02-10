import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { buttonRecipe, badgeRecipe, cardRecipe, tabsRecipe, linkRecipe } from './base';
import { semanticColors } from './colors';
import { fontSizes, lineHeights, letterSpacings } from './typography';
import { fonts } from './fonts';

const config = defineConfig({
  globalCss: {
    'html, body': {
      bg: 'bg.page',
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
    },
    recipes: {
      button: buttonRecipe,
      badge: badgeRecipe,
      link: linkRecipe,
    },
    slotRecipes: {
      card: cardRecipe,
      tabs: tabsRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
