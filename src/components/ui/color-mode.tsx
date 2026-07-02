// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { ThemeProvider, ThemeProviderProps, useTheme } from 'next-themes';

export function ColorModeProvider(props: ThemeProviderProps) {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}

export const useColorMode = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleColorMode = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return {
    theme,
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
};

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}
