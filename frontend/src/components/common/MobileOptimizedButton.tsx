import React from 'react';
import { cn } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeProvider';

interface MobileOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  ...props
}) => {
  const { config } = useTheme();
  const isMobile = config.isMobile;

  const baseClasses = cn(
    // Base styles
    'relative inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95', // Touch feedback
    
    // Mobile optimizations
    isMobile && [
      'min-h-[44px]', // Minimum touch target size
      'touch-manipulation', // Optimize touch interactions
      'select-none', // Prevent text selection on touch
    ],
    
    // Size variants
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2.5 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
      'px-8 py-4 text-xl': size === 'xl',
    },
    
    // Width variants
    {
      'w-full': fullWidth,
    },
    
    // Color variants
    {
      'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary': variant === 'primary',
      'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary': variant === 'secondary',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring': variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground focus:ring-ring': variant === 'ghost',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive': variant === 'destructive',
    },
    
    // Rounded corners based on device
    isMobile ? 'rounded-lg' : 'rounded-md',
    
    className
  );

  const iconClasses = cn(
    'flex-shrink-0',
    {
      'mr-2': iconPosition === 'left' && children,
      'ml-2': iconPosition === 'right' && children,
    }
  );

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={cn('flex items-center', loading && 'opacity-0')}>
        {icon && iconPosition === 'left' && (
          <span className={iconClasses}>{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={iconClasses}>{icon}</span>
        )}
      </div>
    </button>
  );
};
