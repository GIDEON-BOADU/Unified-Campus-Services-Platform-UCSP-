import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Wifi, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  isNetworkError: boolean;
  retryCount: number;
}

export class ApiErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      isNetworkError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isNetworkError = 
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('CORS') ||
      error.name === 'TypeError' && error.message.includes('fetch');

    return { 
      hasError: true, 
      error,
      isNetworkError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ApiErrorBoundary caught an error:', error, errorInfo);
    
    // Log API-specific errors
    console.group('🌐 API Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Is Network Error:', this.state.isNetworkError);
    console.groupEnd();
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }));
      
      // Call the retry callback if provided
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isNetworkError, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              {isNetworkError ? (
                <Wifi className="h-16 w-16 text-orange-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isNetworkError ? 'Connection Problem' : 'API Error'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isNetworkError 
                ? 'Unable to connect to the server. Please check your internet connection and try again.'
                : 'There was an error processing your request. Please try again.'
              }
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again ({this.maxRetries - retryCount} left)
                </button>
              )}
              
              <button
                onClick={this.handleGoBack}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>

            {!canRetry && (
              <p className="text-sm text-gray-500 mt-4">
                Maximum retry attempts reached. Please refresh the page or contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for API error handling in functional components
export const useApiErrorHandler = () => {
  const handleApiError = (error: any, context: string) => {
    console.error(`API Error in ${context}:`, error);
    
    // Categorize error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.detail || 'Server error';
      
      switch (status) {
        case 401:
          console.error('Authentication error - redirecting to login');
          // Handle auth error
          break;
        case 403:
          console.error('Permission denied');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error(`HTTP ${status}: ${message}`);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
    } else {
      // Other error
      console.error('Request setup error:', error.message);
    }
  };

  return { handleApiError };
};