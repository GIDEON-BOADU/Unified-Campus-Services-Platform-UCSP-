import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'theme';

function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
  return isDark;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [isDark, setIsDark] = useState<boolean>(() => applyTheme((localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system'));

  useEffect(() => {
    const mm = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => {
      if (theme === 'system') setIsDark(applyTheme('system'));
    };
    mm.addEventListener?.('change', handle);
    return () => mm.removeEventListener?.('change', handle);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeState(mode);
    setIsDark(applyTheme(mode));
  };

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const value = useMemo(() => ({ theme, isDark, setTheme, toggle }), [theme, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};