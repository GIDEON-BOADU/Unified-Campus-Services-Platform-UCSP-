import React, { useState } from 'react';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemeMode, ColorScheme } from '../../theme/ThemeConfig';
import { cn } from '../../utils/helpers';

export const ThemeSelector: React.FC = () => {
  const { config, setTheme, setColorScheme, toggle } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeModes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { mode: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  const colorSchemes: { scheme: ColorScheme; label: string; preview: string }[] = [
    { scheme: 'ucsp', label: 'UCSP', preview: 'bg-gradient-to-r from-green-500 to-blue-500' },
    { scheme: 'minimal', label: 'Minimal', preview: 'bg-gradient-to-r from-gray-400 to-gray-600' },
    { scheme: 'vibrant', label: 'Vibrant', preview: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { scheme: 'professional', label: 'Professional', preview: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg',
          'bg-background border border-border hover:bg-accent',
          'transition-colors duration-200',
          'touch-target' // Mobile optimization
        )}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-4 space-y-4">
              {/* Theme Mode */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Appearance</h3>
                <div className="space-y-1">
                  {themeModes.map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setTheme(mode);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 rounded-md',
                        'text-left transition-colors duration-200',
                        'hover:bg-accent hover:text-accent-foreground',
                        'touch-target' // Mobile optimization
                      )}
                    >
                      {icon}
                      <span className="text-sm">{label}</span>
                      {config.mode === mode && (
                        <Check className="w-4 h-4 ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Color Scheme</h3>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map(({ scheme, label, preview }) => (
                    <button
                      key={scheme}
                      onClick={() => {
                        setColorScheme(scheme);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'flex flex-col items-center space-y-2 p-3 rounded-lg',
                        'border border-border hover:border-primary/50',
                        'transition-colors duration-200',
                        'touch-target' // Mobile optimization
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-full', preview)} />
                      <span className="text-xs font-medium">{label}</span>
                      {config.colorScheme === scheme && (
                        <Check className="w-3 h-3 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Toggle */}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => {
                    toggle();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md',
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                    'transition-colors duration-200',
                    'touch-target' // Mobile optimization
                  )}
                >
                  {config.isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    Switch to {config.isDark ? 'Light' : 'Dark'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
