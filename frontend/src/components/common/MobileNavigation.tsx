import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Package, User, Settings, LogOut, Bell } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { cn } from '../../utils/helpers';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    userType: 'student' | 'vendor' | 'admin';
    avatar?: string;
  } | undefined;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  onLogout
}) => {
  const { config } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/services', label: 'Services', icon: Package },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Add role-specific navigation items
  if (user?.userType === 'vendor') {
    navigationItems.splice(2, 0, 
      { path: '/vendor/dashboard', label: 'Dashboard', icon: Package },
      { path: '/vendor/services', label: 'My Services', icon: Package }
    );
  } else if (user?.userType === 'admin') {
    navigationItems.splice(2, 0, 
      { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Package }
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <div 
        className={cn(
          'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border z-50',
          'transform transition-transform duration-300 ease-in-out',
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
                  {user.userType}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-3 rounded-md',
                    'text-left transition-colors duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'min-h-[44px]' // Minimum touch target size
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-3 rounded-md',
              'text-left transition-colors duration-200',
              'hover:bg-destructive/10 hover:text-destructive',
              'focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2',
              'min-h-[44px]' // Minimum touch target size
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
