import type { ApiErrorResponse, ValidationError } from '@/shared/types';

export const extractValidationErrors = (
  error: ApiErrorResponse | undefined,
): Record<string, string> => {
  if (!error?.errors) {
    return {};
  }

  return error.errors.reduce(
    (acc, validationError: ValidationError) => {
      acc[validationError.field] = validationError.message;
      return acc;
    },
    {} as Record<string, string>,
  );
};

export const getFirstValidationError = (
  error: ApiErrorResponse | undefined,
): string | undefined => {
  return error?.errors?.[0]?.message;
};

export const hasValidationErrors = (error: ApiErrorResponse | undefined): boolean => {
  return Boolean(error?.errors && error.errors.length > 0);
};
