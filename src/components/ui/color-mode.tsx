import { ThemeProvider, ThemeProviderProps, useTheme } from 'next-themes';

export function ColorModeProvider(props: ThemeProviderProps) {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}

export const useColorMode = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
};

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();

  return colorMode === 'light' ? light : dark;
}
