import type { ErrorInfo } from "../../components/error-handling/ErrorHandler";

export interface ServerError {
  statusCode?: number;
  message?: string;
  error?: string;
  details?: any;
}

// Utility function to navigate with proper basename handling
const navigateTo = (path: string) => {
  // Get the current pathname to determine if we're in a subdirectory
  const currentPath = window.location.pathname;

  // Check if we're in the job-application-manager subdirectory
  if (currentPath.includes("/job-application-manager")) {
    window.location.href = `/job-application-manager${path}`;
  } else {
    window.location.href = path;
  }
};

export const parseServerError = (error: any): ErrorInfo => {
  // Handle network errors
  if (!error.response && error.message) {
    return {
      message: "Network Error",
      details:
        "Unable to connect to the server. Please check your internet connection.",
      type: "error",
      code: "NETWORK_ERROR",
      action: {
        label: "Retry",
        onClick: () => window.location.reload(),
      },
    };
  }

  // Handle server response errors
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          message: "Invalid Request",
          details:
            data.message ||
            "The request contains invalid data. Please check your input and try again.",
          type: "warning",
          code: "BAD_REQUEST",
        };

      case 401:
        return {
          message: "Authentication Required",
          details: "Please log in to access this feature.",
          type: "warning",
          code: "UNAUTHORIZED",
          action: {
            label: "Sign In",
            onClick: () => navigateTo("/signin"),
          },
        };

      case 403:
        return {
          message: "Access Denied",
          details: "You don't have permission to perform this action.",
          type: "error",
          code: "FORBIDDEN",
        };

      case 404:
        return {
          message: "Resource Not Found",
          details: "The requested data could not be found.",
          type: "warning",
          code: "NOT_FOUND",
        };

      case 409:
        return {
          message: "Conflict",
          details:
            data.message ||
            "This resource already exists or conflicts with existing data.",
          type: "warning",
          code: "CONFLICT",
        };

      case 422:
        return {
          message: "Validation Error",
          details:
            data.message ||
            "Please check your input and ensure all required fields are filled correctly.",
          type: "warning",
          code: "VALIDATION_ERROR",
        };

      case 429:
        return {
          message: "Too Many Requests",
          details:
            "You've made too many requests. Please wait a moment before trying again.",
          type: "warning",
          code: "RATE_LIMIT",
          action: {
            label: "Retry Later",
            onClick: () => setTimeout(() => window.location.reload(), 5000),
          },
        };

      case 500:
        return {
          message: "Server Error",
          details: "Something went wrong on our end. Please try again later.",
          type: "error",
          code: "INTERNAL_ERROR",
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
        };

      case 502:
      case 503:
      case 504:
        return {
          message: "Service Unavailable",
          details:
            "The server is temporarily unavailable. Please try again later.",
          type: "error",
          code: "SERVICE_UNAVAILABLE",
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
        };

      default:
        return {
          message: "Unexpected Error",
          details:
            data.message || "An unexpected error occurred. Please try again.",
          type: "error",
          code: `HTTP_${status}`,
        };
    }
  }

  // Handle generic errors
  if (error.message) {
    return {
      message: "Error",
      details: error.message,
      type: "error",
      code: "GENERIC_ERROR",
    };
  }

  // Fallback
  return {
    message: "Unknown Error",
    details: "An unexpected error occurred. Please try again.",
    type: "error",
    code: "UNKNOWN_ERROR",
    action: {
      label: "Retry",
      onClick: () => window.location.reload(),
    },
  };
};

export const createErrorInfo = (
  message: string,
  type: "error" | "warning" | "info" = "error",
  details?: string,
  code?: string,
  action?: { label: string; onClick: () => void }
): ErrorInfo => {
  return {
    message,
    type,
    details,
    code,
    action,
  };
};
