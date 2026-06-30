// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Extracts a user-friendly error message from RTK Query errors
 */
export function extractApiError(error: FetchBaseQueryError | SerializedError): string {
  if ('data' in error && error.data) {
    if (typeof error.data === 'object' && 'error' in error.data) {
      return (error.data as { error: string }).error;
    }
    if (typeof error.data === 'object' && 'message' in error.data) {
      return (error.data as { message: string }).message;
    }
    if (typeof error.data === 'string') {
      return error.data;
    }
  }

  if ('status' in error) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. This resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${error.status}`;
    }
  }

  if ('message' in error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if an error is a network/connection error
 */
export function isNetworkError(error: FetchBaseQueryError | SerializedError): boolean {
  if ('status' in error) {
    return error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR';
  }
  if ('code' in error) {
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR';
  }
  return false;
}

/**
 * Checks if an error is a validation error (400/422)
 */
export function isValidationError(error: FetchBaseQueryError | SerializedError): boolean {
  if ('status' in error) {
    return error.status === 400 || error.status === 422;
  }
  return false;
}

/**
 * Checks if an error is an authentication error (401)
 */
export function isAuthError(error: FetchBaseQueryError | SerializedError): boolean {
  if ('status' in error) {
    return error.status === 401;
  }
  return false;
}
