import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark, toggle } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        className={`p-2 rounded-md border ${theme === 'light' ? 'bg-primary text-white' : 'bg-background'}`}
        title="Light"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`p-2 rounded-md border ${theme === 'dark' ? 'bg-primary text-white' : 'bg-background'}`}
        title="Dark"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
        className={`p-2 rounded-md border ${theme === 'system' ? 'bg-primary text-white' : 'bg-background'}`}
        title="System"
      >
        <Monitor className="h-4 w-4" />
      </button>
      {/* Optional quick toggle */}
      <button
        type="button"
        onClick={toggle}
        className="p-2 rounded-md border"
        title="Toggle light/dark"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
};