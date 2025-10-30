// API Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
}

export interface AxiosErrorResponse {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}

export const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export const getErrorMessage = (error: unknown, defaultMessage = 'An error occurred'): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};
