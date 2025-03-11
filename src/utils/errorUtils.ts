/**
 * Utility functions for standardized error handling
 */

// Define a type for API error responses
interface ApiErrorResponse {
  data?: {
    message?: string;
    error?: string;
  };
}

/**
 * Extracts a user-friendly error message from various error types
 * 
 * @param error - The error object from a catch block
 * @returns A user-friendly error message string
 */
export const getErrorMessage = (error: unknown): string => {
  // Handle API errors with response data
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: ApiErrorResponse };
    const errorData = apiError.response?.data;
    
    if (errorData) {
      return errorData.message || 
             errorData.error || 
             'An unexpected error occurred. Please try again.';
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred. Please try again.';
  }
  
  // Default error message for unknown error types
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Logs errors to console in development environment only
 * 
 * @param message - Error context message
 * @param error - The error object
 */
export const logError = (message: string, error: unknown): void => {
  // Only log in development environment
  if (import.meta.env.MODE !== 'production') {
    console.error(message, error);
  }
};
