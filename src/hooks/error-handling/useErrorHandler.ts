import { useState, useCallback } from "react";
import type { ErrorInfo } from "../../components/error-handling/ErrorHandler";
import { parseServerError } from "../../utils/error-handling/errorUtils";

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleError = useCallback((err: any) => {
    setError(parseServerError(err));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setCustomError = useCallback((errorInfo: ErrorInfo) => {
    setError(errorInfo);
  }, []);

  return {
    error,
    handleError,
    clearError,
    setCustomError,
  };
};
