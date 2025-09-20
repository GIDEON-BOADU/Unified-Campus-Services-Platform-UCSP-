/**
 * Comprehensive error handling utilities for API calls and user feedback
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  timestamp: Date;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: ApiError; context: ErrorContext }> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors with proper categorization and user feedback
   */
  handleApiError(error: any, context: ErrorContext): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: 500,
      code: 'UNKNOWN_ERROR'
    };

    // Network errors
    if (!error.response && error.request) {
      apiError.message = 'Network error. Please check your internet connection.';
      apiError.code = 'NETWORK_ERROR';
      apiError.status = 0;
    }
    // Server errors
    else if (error.response) {
      const { status, data } = error.response;
      apiError.status = status;
      
      switch (status) {
        case 400:
          apiError.message = data?.message || data?.detail || 'Invalid request. Please check your input.';
          apiError.code = 'BAD_REQUEST';
          break;
        case 401:
          apiError.message = 'Authentication required. Please log in again.';
          apiError.code = 'UNAUTHORIZED';
          break;
        case 403:
          apiError.message = 'You do not have permission to perform this action.';
          apiError.code = 'FORBIDDEN';
          break;
        case 404:
          apiError.message = 'The requested resource was not found.';
          apiError.code = 'NOT_FOUND';
          break;
        case 422:
          apiError.message = 'Validation error. Please check your input.';
          apiError.code = 'VALIDATION_ERROR';
          apiError.details = data?.errors || data?.detail;
          break;
        case 429:
          apiError.message = 'Too many requests. Please try again later.';
          apiError.code = 'RATE_LIMITED';
          break;
        case 500:
          apiError.message = 'Server error. Please try again later.';
          apiError.code = 'INTERNAL_SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          apiError.message = 'Service temporarily unavailable. Please try again later.';
          apiError.code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          apiError.message = data?.message || data?.detail || `Server error (${status})`;
          apiError.code = 'HTTP_ERROR';
      }
    }
    // Other errors
    else {
      apiError.message = error.message || 'An unexpected error occurred';
      apiError.code = 'UNKNOWN_ERROR';
    }

    // Log error
    this.logError(apiError, context);

    return apiError;
  }

  /**
   * Handle form validation errors
   */
  handleValidationError(errors: Record<string, string[]>): string {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    
    return `Validation errors:\n${errorMessages}`;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): { shouldRedirect: boolean; message: string } {
    if (error.response?.status === 401) {
      return {
        shouldRedirect: true,
        message: 'Your session has expired. Please log in again.'
      };
    }
    
    return {
      shouldRedirect: false,
      message: 'Authentication error. Please try again.'
    };
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(error: ApiError, context: ErrorContext): void {
    const errorEntry = { error, context };
    this.errorLog.push(errorEntry);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 API Error - ${context.operation}`);
      console.error('Error:', error);
      console.error('Context:', context);
      console.error('Timestamp:', context.timestamp.toISOString());
      console.groupEnd();
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, context);
    }
  }

  /**
   * Report error to external service (implement as needed)
   */
  private reportError(error: ApiError, context: ErrorContext): void {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, { extra: context });
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): Array<{ error: ApiError; context: ErrorContext }> {
    return [...this.errorLog];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  context: Omit<ErrorContext, 'timestamp'>
): Promise<{ data?: T; error?: ApiError }> => {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    const apiError = errorHandler.handleApiError(error, {
      ...context,
      timestamp: new Date()
    });
    return { error: apiError };
  }
};

// Error message formatter for user display
export const formatErrorMessage = (error: ApiError): string => {
  if (error.details && typeof error.details === 'object') {
    const details = Object.entries(error.details)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
      .join('\n');
    return `${error.message}\n\nDetails:\n${details}`;
  }
  return error.message;
};

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export const getErrorSeverity = (error: ApiError): ErrorSeverity => {
  if (error.status === 0 || error.code === 'NETWORK_ERROR') {
    return ErrorSeverity.MEDIUM;
  }
  if (error.status && error.status >= 500) {
    return ErrorSeverity.HIGH;
  }
  if (error.status === 401 || error.status === 403) {
    return ErrorSeverity.HIGH;
  }
  if (error.status === 404) {
    return ErrorSeverity.LOW;
  }
  return ErrorSeverity.MEDIUM;
};
