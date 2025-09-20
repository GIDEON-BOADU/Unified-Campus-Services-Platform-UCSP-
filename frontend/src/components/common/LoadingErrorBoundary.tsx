import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  isLoading: boolean;
}

export class LoadingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      isLoading: false 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LoadingErrorBoundary caught an error:', error, errorInfo);
    
    // Log loading-specific errors
    console.group('⏳ Loading Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isLoading: true });
    
    // Call the retry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    
    // Reset loading state after a delay
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 1000);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-32 bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {this.props.errorMessage || 'Failed to Load'}
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              Something went wrong while loading this content.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-2 bg-red-50 rounded text-left">
                <pre className="text-xs text-red-700 overflow-auto max-h-20">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (this.state.isLoading) {
      return (
        <div className="min-h-32 bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              {this.props.loadingMessage || 'Loading...'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger loading error boundary
export const useLoadingErrorHandler = () => {
  return (error: Error) => {
    console.error('Loading Error caught by useLoadingErrorHandler:', error);
  };
};
