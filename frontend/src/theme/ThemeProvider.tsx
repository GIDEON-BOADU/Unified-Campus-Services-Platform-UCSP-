import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ThemeConfig, ThemeMode, DeviceType, ColorScheme, getThemeCSS, responsiveTokens, mobileOptimizations } from './ThemeConfig';

type ThemeContextValue = {
  config: ThemeConfig;
  setTheme: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggle: () => void;
  updateDeviceType: (deviceType: DeviceType) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'theme';
const COLOR_SCHEME_KEY = 'colorScheme';

// Device detection utility
const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Safe localStorage access
const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
};

const getStoredColorScheme = (): ColorScheme => {
  if (typeof window === 'undefined') return 'ucsp';
  try {
    const stored = localStorage.getItem(COLOR_SCHEME_KEY) as ColorScheme | null;
    return stored && ['ucsp', 'minimal', 'vibrant', 'professional'].includes(stored) ? stored : 'ucsp';
  } catch {
    return 'ucsp';
  }
};

// Apply theme with mobile optimizations
function applyTheme(config: ThemeConfig) {
  if (typeof window === 'undefined') return false;
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = config.mode === 'dark' || (config.mode === 'system' && prefersDark);
  
  // Apply dark mode class
  document.documentElement.classList.toggle('dark', isDark);
  
  // Apply device-specific classes
  document.documentElement.classList.remove('mobile', 'tablet', 'desktop');
  document.documentElement.classList.add(config.deviceType);
  
  // Apply color scheme class
  document.documentElement.classList.remove('ucsp', 'minimal', 'vibrant', 'professional');
  document.documentElement.classList.add(config.colorScheme);
  
  // Apply mobile optimizations
  if (config.isMobile) {
    document.documentElement.style.setProperty('--font-size-min', mobileOptimizations.typography.minFontSize);
    document.documentElement.style.setProperty('--touch-target-min', mobileOptimizations.touchTargets.minSize);
    document.documentElement.style.setProperty('--touch-target-spacing', mobileOptimizations.touchTargets.spacing);
  }
  
  // Apply theme CSS variables
  const themeCSS = getThemeCSS({ ...config, isDark });
  const style = document.getElementById('theme-variables') as HTMLStyleElement;
  if (style) {
    style.textContent = themeCSS;
  } else {
    const newStyle = document.createElement('style');
    newStyle.id = 'theme-variables';
    newStyle.textContent = themeCSS;
    document.head.appendChild(newStyle);
  }
  
  return isDark;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType);
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getStoredColorScheme);

  const config: ThemeConfig = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        mode: 'system',
        deviceType: 'desktop',
        colorScheme: 'ucsp',
        isDark: false,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    
    return {
      mode: theme,
      deviceType,
      colorScheme,
      isDark,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
    };
  }, [theme, deviceType, colorScheme]);

  const [isDark, setIsDark] = useState<boolean>(() => applyTheme(config));

  // Handle device type changes
  const updateDeviceType = useCallback((newDeviceType: DeviceType) => {
    setDeviceType(newDeviceType);
  }, []);

  // Handle window resize for device type detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      try {
        const newDeviceType = getDeviceType();
        if (newDeviceType !== deviceType) {
          updateDeviceType(newDeviceType);
        }
      } catch (error) {
        console.warn('Error handling window resize:', error);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceType, updateDeviceType]);

  // Handle system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const mm = window.matchMedia('(prefers-color-scheme: dark)');
      const handle = () => {
        if (theme === 'system') {
          const newIsDark = applyTheme(config);
          setIsDark(newIsDark);
        }
      };
      mm.addEventListener?.('change', handle);
      return () => mm.removeEventListener?.('change', handle);
    } catch (error) {
      console.warn('Error setting up system theme listener:', error);
    }
  }, [theme, config]);

  // Apply theme when config changes
  useEffect(() => {
    try {
      const newIsDark = applyTheme(config);
      setIsDark(newIsDark);
    } catch (error) {
      console.warn('Error applying theme:', error);
      setIsDark(false); // Fallback to light mode
    }
  }, [config]);

  const setTheme = (mode: ThemeMode) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
      }
      setThemeState(mode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
      setThemeState(mode);
    }
  };

  const setColorScheme = (scheme: ColorScheme) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(COLOR_SCHEME_KEY, scheme);
      }
      setColorSchemeState(scheme);
    } catch (error) {
      console.warn('Failed to save color scheme to localStorage:', error);
      setColorSchemeState(scheme);
    }
  };

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const value = useMemo(() => ({ 
    config, 
    setTheme, 
    setColorScheme, 
    toggle, 
    updateDeviceType 
  }), [config, setTheme, setColorScheme, toggle, updateDeviceType]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};