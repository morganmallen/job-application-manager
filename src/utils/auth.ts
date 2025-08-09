/**
 * Authentication utilities for handling tokens and automatic refresh
 */

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface User {
  userID: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Get the current access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

/**
 * Get the current refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Store authentication tokens and user data
 */
export const storeAuthData = (tokens: AuthTokens, user?: User): void => {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = (): boolean => {
  return !!(getAccessToken() && getRefreshToken());
};

/**
 * Attempt to refresh the access token using the refresh token
 * Returns true if successful, false if refresh token is invalid
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      // Refresh token is invalid, clear auth data
      clearAuthData();
      return false;
    }

    const data = await response.json();

    // Update only the access token, keep the same refresh token
    localStorage.setItem("access_token", data.access_token);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearAuthData();
    return false;
  }
};

/**
 * Enhanced fetch function that automatically handles token refresh
 * If the initial request fails with 401, it attempts to refresh the token and retry
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  // Make the initial request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401 (Unauthorized), try to refresh the token and retry
  if (response.status === 401) {
    const refreshSuccessful = await refreshAccessToken();

    if (refreshSuccessful) {
      // Retry the request with the new token
      const newAccessToken = getAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/signin";
      throw new Error("Authentication failed");
    }
  }

  return response;
};

/**
 * Logout the user by revoking the refresh token and clearing local data
 */
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error("Failed to revoke refresh token:", error);
    }
  }

  clearAuthData();
};

/**
 * Verify if the current access token is valid
 * Attempts refresh if the token is expired
 */
export const verifyAndRefreshToken = async (): Promise<boolean> => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return false;
  }

  try {
    // Try to verify the current token
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/verify`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      return true;
    }

    // Token is invalid/expired, try to refresh
    if (response.status === 401) {
      return await refreshAccessToken();
    }

    return false;
  } catch (error) {
    console.error("Token verification failed:", error);
    // Try to refresh on network errors too
    return await refreshAccessToken();
  }
};
