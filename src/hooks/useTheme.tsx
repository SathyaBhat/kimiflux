import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  ThemeFlavor,
  ThemeColors,
  getThemeByFlavor,
  getDefaultThemeFlavor,
  saveThemeFlavor,
  applyTheme,
  getSystemTheme,
} from '../themes/catppuccin';

interface ThemeContextType {
  flavor: ThemeFlavor;
  theme: ThemeColors;
  setFlavor: (flavor: ThemeFlavor) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [flavor, setFlavorState] = useState<ThemeFlavor>(getDefaultThemeFlavor);
  const [theme, setTheme] = useState<ThemeColors>(getThemeByFlavor(getDefaultThemeFlavor()));
  const [isDark, setIsDark] = useState<boolean>(false);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
    
    // Determine if current theme is dark
    if (flavor === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    } else {
      setIsDark(flavor !== 'latte');
    }
  }, [theme, flavor]);

  // Listen for system theme changes when on 'system' mode
  useEffect(() => {
    if (flavor !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newTheme = getSystemTheme();
      setTheme(newTheme);
      setIsDark(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [flavor]);

  const setFlavor = useCallback((newFlavor: ThemeFlavor) => {
    setFlavorState(newFlavor);
    saveThemeFlavor(newFlavor);
    setTheme(getThemeByFlavor(newFlavor));
  }, []);

  return (
    <ThemeContext.Provider value={{ flavor, theme, setFlavor, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
