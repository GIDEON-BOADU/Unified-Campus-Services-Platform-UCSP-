/**
 * Comprehensive theme configuration for UCSP platform
 * Supports desktop and mobile with responsive design tokens
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ColorScheme = 'ucsp' | 'minimal' | 'vibrant' | 'professional';

export interface ThemeConfig {
  mode: ThemeMode;
  deviceType: DeviceType;
  colorScheme: ColorScheme;
  isDark: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface ResponsiveTokens {
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  typography: {
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Color schemes
export const colorSchemes = {
  ucsp: {
    light: {
      primary: 'hsl(142, 100%, 35%)',
      secondary: 'hsl(43, 74%, 49%)',
      accent: 'hsl(180, 65%, 25%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(43, 15%, 98%)',
      text: 'hsl(25, 15%, 15%)',
      muted: 'hsl(25, 15%, 45%)',
    },
    dark: {
      primary: 'hsl(142, 100%, 50%)',
      secondary: 'hsl(43, 74%, 60%)',
      accent: 'hsl(180, 65%, 40%)',
      background: 'hsl(222.2, 84%, 4.9%)',
      surface: 'hsl(217.2, 32.6%, 17.5%)',
      text: 'hsl(210, 40%, 98%)',
      muted: 'hsl(215, 20.2%, 65.1%)',
    }
  },
  minimal: {
    light: {
      primary: 'hsl(220, 13%, 18%)',
      secondary: 'hsl(220, 13%, 46%)',
      accent: 'hsl(220, 13%, 70%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(220, 13%, 98%)',
      text: 'hsl(220, 13%, 18%)',
      muted: 'hsl(220, 13%, 46%)',
    },
    dark: {
      primary: 'hsl(220, 13%, 85%)',
      secondary: 'hsl(220, 13%, 60%)',
      accent: 'hsl(220, 13%, 40%)',
      background: 'hsl(220, 13%, 8%)',
      surface: 'hsl(220, 13%, 12%)',
      text: 'hsl(220, 13%, 85%)',
      muted: 'hsl(220, 13%, 60%)',
    }
  },
  vibrant: {
    light: {
      primary: 'hsl(262, 83%, 58%)',
      secondary: 'hsl(291, 64%, 42%)',
      accent: 'hsl(47, 96%, 53%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(262, 83%, 98%)',
      text: 'hsl(220, 13%, 18%)',
      muted: 'hsl(220, 13%, 46%)',
    },
    dark: {
      primary: 'hsl(262, 83%, 70%)',
      secondary: 'hsl(291, 64%, 60%)',
      accent: 'hsl(47, 96%, 65%)',
      background: 'hsl(220, 13%, 8%)',
      surface: 'hsl(262, 83%, 12%)',
      text: 'hsl(220, 13%, 85%)',
      muted: 'hsl(220, 13%, 60%)',
    }
  },
  professional: {
    light: {
      primary: 'hsl(221, 83%, 53%)',
      secondary: 'hsl(210, 40%, 98%)',
      accent: 'hsl(142, 69%, 58%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(210, 40%, 98%)',
      text: 'hsl(222.2, 47.4%, 11.2%)',
      muted: 'hsl(215, 20.2%, 65.1%)',
    },
    dark: {
      primary: 'hsl(221, 83%, 65%)',
      secondary: 'hsl(217.2, 32.6%, 17.5%)',
      accent: 'hsl(142, 69%, 70%)',
      background: 'hsl(222.2, 84%, 4.9%)',
      surface: 'hsl(217.2, 32.6%, 17.5%)',
      text: 'hsl(210, 40%, 98%)',
      muted: 'hsl(215, 20.2%, 65.1%)',
    }
  }
};

// Responsive design tokens
export const responsiveTokens: Record<DeviceType, ResponsiveTokens> = {
  mobile: {
    spacing: {
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px
      md: '0.75rem',    // 12px
      lg: '1rem',       // 16px
      xl: '1.5rem',     // 24px
      '2xl': '2rem',    // 32px
    },
    typography: {
      fontSize: {
        xs: '0.75rem',   // 12px
        sm: '0.875rem',  // 14px
        base: '1rem',    // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    borderRadius: {
      sm: '0.25rem',    // 4px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
  },
  tablet: {
    spacing: {
      xs: '0.375rem',   // 6px
      sm: '0.75rem',    // 12px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
      '2xl': '2.5rem',  // 40px
    },
    typography: {
      fontSize: {
        xs: '0.875rem',  // 14px
        sm: '1rem',      // 16px
        base: '1.125rem', // 18px
        lg: '1.25rem',   // 20px
        xl: '1.5rem',    // 24px
        '2xl': '1.875rem', // 30px
        '3xl': '2.25rem',  // 36px
        '4xl': '3rem',     // 48px
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    borderRadius: {
      sm: '0.375rem',   // 6px
      md: '0.75rem',    // 12px
      lg: '1rem',       // 16px
      xl: '1.25rem',    // 20px
    },
    shadows: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
  },
  desktop: {
    spacing: {
      xs: '0.5rem',     // 8px
      sm: '1rem',       // 16px
      md: '1.5rem',     // 24px
      lg: '2rem',       // 32px
      xl: '3rem',       // 48px
      '2xl': '4rem',    // 64px
    },
    typography: {
      fontSize: {
        xs: '0.875rem',  // 14px
        sm: '1rem',      // 16px
        base: '1.125rem', // 18px
        lg: '1.25rem',   // 20px
        xl: '1.5rem',    // 24px
        '2xl': '2rem',   // 32px
        '3xl': '2.5rem', // 40px
        '4xl': '3.5rem', // 56px
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    borderRadius: {
      sm: '0.5rem',     // 8px
      md: '0.75rem',    // 12px
      lg: '1rem',       // 16px
      xl: '1.5rem',     // 24px
    },
    shadows: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
  },
};

// Mobile-specific optimizations
export const mobileOptimizations = {
  touchTargets: {
    minSize: '44px', // Minimum touch target size
    spacing: '8px',  // Minimum spacing between touch targets
  },
  typography: {
    minFontSize: '16px', // Prevent zoom on iOS
    lineHeight: '1.5',   // Better readability on small screens
  },
  interactions: {
    hoverDelay: '0ms',   // No hover delay on mobile
    tapHighlight: 'transparent', // Remove tap highlight
  },
  performance: {
    reducedMotion: 'prefers-reduced-motion: reduce',
    willChange: 'transform', // Optimize for animations
  },
};

// Theme utilities
export const getThemeCSS = (config: ThemeConfig): string => {
  const scheme = colorSchemes[config.colorScheme][config.isDark ? 'dark' : 'light'];
  const tokens = responsiveTokens[config.deviceType];
  
  return `
    :root {
      --theme-primary: ${scheme.primary};
      --theme-secondary: ${scheme.secondary};
      --theme-accent: ${scheme.accent};
      --theme-background: ${scheme.background};
      --theme-surface: ${scheme.surface};
      --theme-text: ${scheme.text};
      --theme-muted: ${scheme.muted};
      
      --spacing-xs: ${tokens.spacing.xs};
      --spacing-sm: ${tokens.spacing.sm};
      --spacing-md: ${tokens.spacing.md};
      --spacing-lg: ${tokens.spacing.lg};
      --spacing-xl: ${tokens.spacing.xl};
      --spacing-2xl: ${tokens.spacing['2xl']};
      
      --font-size-xs: ${tokens.typography.fontSize.xs};
      --font-size-sm: ${tokens.typography.fontSize.sm};
      --font-size-base: ${tokens.typography.fontSize.base};
      --font-size-lg: ${tokens.typography.fontSize.lg};
      --font-size-xl: ${tokens.typography.fontSize.xl};
      --font-size-2xl: ${tokens.typography.fontSize['2xl']};
      --font-size-3xl: ${tokens.typography.fontSize['3xl']};
      --font-size-4xl: ${tokens.typography.fontSize['4xl']};
      
      --line-height-tight: ${tokens.typography.lineHeight.tight};
      --line-height-normal: ${tokens.typography.lineHeight.normal};
      --line-height-relaxed: ${tokens.typography.lineHeight.relaxed};
      
      --border-radius-sm: ${tokens.borderRadius.sm};
      --border-radius-md: ${tokens.borderRadius.md};
      --border-radius-lg: ${tokens.borderRadius.lg};
      --border-radius-xl: ${tokens.borderRadius.xl};
      
      --shadow-sm: ${tokens.shadows.sm};
      --shadow-md: ${tokens.shadows.md};
      --shadow-lg: ${tokens.shadows.lg};
      --shadow-xl: ${tokens.shadows.xl};
      
      --touch-target-min: ${mobileOptimizations.touchTargets.minSize};
      --touch-target-spacing: ${mobileOptimizations.touchTargets.spacing};
      --font-size-min: ${mobileOptimizations.typography.minFontSize};
    }
  `;
};
