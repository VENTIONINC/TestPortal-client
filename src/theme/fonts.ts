import { defineTokens } from '@chakra-ui/react';

/**
 * Определение семейств шрифтов для использования в проекте
 *
 * После добавления шрифтов в /public/fonts/ и настройки @font-face в fonts.css,
 * раскомментируйте и настройте нужные токены ниже
 */

export const fonts = defineTokens.fonts({
  // Основной шрифт для текста
  body: {
    value: 'Aeonik Pro, system-ui, -apple-system, sans-serif',
  },

  // Шрифт для заголовков
  heading: {
    value: 'Aeonik Pro, system-ui, -apple-system, sans-serif',
  },

  // Моноширинный шрифт для кода
  mono: {
    value: 'Consolas, Monaco, "Courier New", monospace',
  },
});

// Альтернативный вариант, если хотите использовать разные шрифты:
// export const fonts = defineTokens.fonts({
//   body: {
//     value: 'YourBodyFont, system-ui, sans-serif'
//   },
//   heading: {
//     value: 'YourHeadingFont, system-ui, sans-serif'
//   },
//   mono: {
//     value: 'Consolas, monospace'
//   },
// });
