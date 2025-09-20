import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  className = '',
  variant = 'spinner',
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600 bg-blue-600',
    gray: 'border-gray-600 bg-gray-600',
    white: 'border-white bg-white'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[1]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[1]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[1]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[1]} rounded-full animate-pulse`}></div>
        );
      
      case 'skeleton':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded h-4 w-full mb-2"></div>
            <div className="bg-gray-300 rounded h-4 w-3/4 mb-2"></div>
            <div className="bg-gray-300 rounded h-4 w-1/2"></div>
          </div>
        );
      
      default:
        return (
          <div
            className={`animate-spin rounded-full border-2 border-gray-300 border-t-2 ${sizeClasses[size]} ${colorClasses[color].split(' ')[0]}`}
            style={{ borderTopColor: 'transparent' }}
          />
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}; 