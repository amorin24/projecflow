import axios from 'axios';

/**
 * Standardized error handling utility to extract meaningful error messages
 * from different error types (Axios errors, standard errors, etc.)
 */
export const getErrorMessage = (error: unknown): string => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    // Check for server response with error message
    if (error.response?.data) {
      const { data } = error.response;
      
      // Handle structured error responses
      if (typeof data === 'object' && data !== null) {
        if ('message' in data && typeof data.message === 'string') {
          return data.message;
        }
        if ('error' in data && typeof data.error === 'string') {
          return data.error;
        }
      }
      
      // Handle string error responses
      if (typeof data === 'string') {
        return data;
      }
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    // Use status text if available
    if (error.response?.statusText) {
      return `Error: ${error.response.statusText}`;
    }
    
    // Fallback to generic message with status code
    if (error.response?.status) {
      return `Server error (${error.response.status}). Please try again later.`;
    }
    
    // Fallback to error message
    return error.message || 'An unknown error occurred';
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback for unknown error types
  return 'An unknown error occurred';
};

/**
 * Type guard to check if an error is an Axios error
 */
function isAxiosError(error: unknown): error is any {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

/**
 * Format validation errors from the backend into a user-friendly format
 */
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
};

/**
 * Log errors to the console in development mode
 */
export const logError = (error: unknown): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error);
  }
};
