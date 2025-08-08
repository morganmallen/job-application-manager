import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorHandler } from "../error-handling";
import "./styles.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsAuthenticated(false);
        setError({
          message: "Authentication Required",
          details: "Please log in to access this page.",
          type: "warning",
          code: "AUTH_REQUIRED",
          action: {
            label: "Sign In",
            onClick: () => navigate("/signin"),
          },
        });
        return;
      }

      try {
        // Verify token is valid by making a test request
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          // Token is invalid, clear it and redirect
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setError({
            message: "Session Expired",
            details: "Your session has expired. Please log in again.",
            type: "warning",
            code: "SESSION_EXPIRED",
            action: {
              label: "Sign In",
              onClick: () => navigate("/signin"),
            },
          });
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        // Network error or other issues
        setIsAuthenticated(false);
        setError({
          message: "Authentication Error",
          details: "Unable to verify your authentication. Please log in again.",
          type: "error",
          code: "AUTH_ERROR",
          action: {
            label: "Sign In",
            onClick: () => navigate("/signin"),
          },
        });
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="app page-root">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app page-root">
        <div className="auth-error-container">
          <ErrorHandler error={error} />
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
