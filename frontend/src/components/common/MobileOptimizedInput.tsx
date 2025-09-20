import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeProvider';

interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const MobileOptimizedInput = forwardRef<HTMLInputElement, MobileOptimizedInputProps>(
  ({
    label,
    error,
    helperText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
    type = 'text',
    ...props
  }, ref) => {
    const { config } = useTheme();
    const isMobile = config.isMobile;

    const inputClasses = cn(
      // Base styles
      'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors duration-200',
      
      // Mobile optimizations
      isMobile && [
        'text-base', // Prevent zoom on iOS
        'min-h-[44px]', // Minimum touch target size
        'touch-manipulation', // Optimize touch interactions
      ],
      
      // Icon positioning
      {
        'pl-10': icon && iconPosition === 'left',
        'pr-10': icon && iconPosition === 'right',
      },
      
      // Error state
      error && 'border-destructive focus:ring-destructive',
      
      // Width
      fullWidth ? 'w-full' : 'w-auto',
      
      className
    );

    const iconClasses = cn(
      'absolute top-1/2 transform -translate-y-1/2 text-muted-foreground',
      {
        'left-3': iconPosition === 'left',
        'right-3': iconPosition === 'right',
      }
    );

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className={iconClasses}>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

MobileOptimizedInput.displayName = 'MobileOptimizedInput';
