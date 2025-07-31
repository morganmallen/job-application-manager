import React from "react";
import "./ErrorHandler.css";

export interface ErrorInfo {
  message: string;
  type?: "error" | "warning" | "info";
  code?: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorHandlerProps {
  error: ErrorInfo | null;
  onDismiss?: () => void;
  className?: string;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onDismiss,
  className = "",
}) => {
  if (!error) return null;

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "❌";
    }
  };

  const getErrorClass = (type: string) => {
    switch (type) {
      case "warning":
        return "error-handler--warning";
      case "info":
        return "error-handler--info";
      default:
        return "error-handler--error";
    }
  };

  return (
    <div
      className={`error-handler ${getErrorClass(
        error.type || "error"
      )} ${className}`}
    >
      <div className="error-handler__content">
        <div className="error-handler__icon">
          {getErrorIcon(error.type || "error")}
        </div>
        <div className="error-handler__text">
          <h4 className="error-handler__title">{error.message}</h4>
          {error.details && (
            <p className="error-handler__details">{error.details}</p>
          )}
          {error.code && (
            <code className="error-handler__code">
              Error Code: {error.code}
            </code>
          )}
        </div>
        {onDismiss && (
          <button
            className="error-handler__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
      {error.action && (
        <div className="error-handler__action">
          <button
            className="error-handler__action-btn"
            onClick={error.action.onClick}
          >
            {error.action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorHandler;
