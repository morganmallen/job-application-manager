import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../loading";
import { ErrorHandler } from "../error-handling";
import {
  isAuthenticated,
  verifyAndRefreshToken,
  clearAuthData,
} from "../../utils/auth";
import "./styles.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<
    boolean | null
  >(null);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // First check if we have tokens at all
      if (!isAuthenticated()) {
        setIsAuthenticatedState(false);
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
        // Verify and potentially refresh the token
        const isValid = await verifyAndRefreshToken();

        if (isValid) {
          setIsAuthenticatedState(true);
          setError(null);
        } else {
          // Token verification and refresh both failed
          clearAuthData();
          setIsAuthenticatedState(false);
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
        }
      } catch (err) {
        // Network error or other issues
        console.error("Authentication check failed:", err);
        setIsAuthenticatedState(false);
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
  if (isAuthenticatedState === null) {
    return (
      fallback || (
        <div className="app page-root">
          <Loading message="Verifying authentication..." fullScreen={true} />
        </div>
      )
    );
  }

  // Show error if not authenticated
  if (!isAuthenticatedState) {
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
