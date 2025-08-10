/**
 * API client utilities with automatic token refresh
 */

import { authenticatedFetch } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

/**
 * Enhanced API client that automatically handles authentication and token refresh
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { skipAuth = false, headers = {}, ...requestOptions } = options;

    // Set default content type for requests with body
    if (requestOptions.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;

    if (skipAuth) {
      // Make request without authentication
      response = await fetch(url, {
        ...requestOptions,
        headers,
      });
    } else {
      // Use authenticated fetch with automatic token refresh
      response = await authenticatedFetch(url, {
        ...requestOptions,
        headers,
      });
    }

    if (!response.ok) {
      const error = new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
      (error as any).response = response;
      (error as any).status = response.status;
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as any;
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * Make an unauthenticated request (for login, register, etc.)
   */
  async publicRequest<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, skipAuth: true });
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Convenience methods for common operations
export const api = {
  // Authentication endpoints (public)
  auth: {
    login: (email: string, password: string) =>
      apiClient.publicRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (userData: any) =>
      apiClient.publicRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    refresh: (refreshToken: string) =>
      apiClient.publicRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    logout: (refreshToken: string) =>
      apiClient.publicRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    verify: () => apiClient.get("/auth/verify"),
    forgotPassword: (email: string) =>
      apiClient.publicRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, newPassword: string) =>
      apiClient.publicRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  // Applications
  applications: {
    getAll: () => apiClient.get("/applications"),
    getById: (id: string) => apiClient.get(`/applications/${id}`),
    create: (data: any) => apiClient.post("/applications", data),
    update: (id: string, data: any) =>
      apiClient.patch(`/applications/${id}`, data),
    delete: (id: string) => apiClient.delete(`/applications/${id}`),
  },

  // Companies
  companies: {
    getAll: () => apiClient.get("/companies"),
    getById: (id: string) => apiClient.get(`/companies/${id}`),
    search: (name: string) =>
      apiClient.get(`/companies/search/${encodeURIComponent(name)}`),
    create: (data: any) => apiClient.post("/companies", data),
    update: (id: string, data: any) =>
      apiClient.patch(`/companies/${id}`, data),
    delete: (id: string) => apiClient.delete(`/companies/${id}`),
  },

  // Events
  events: {
    getAll: (applicationId?: string) => {
      const query = applicationId ? `?applicationId=${applicationId}` : "";
      return apiClient.get(`/events${query}`);
    },
    getById: (id: string) => apiClient.get(`/events/${id}`),
    create: (data: any) => apiClient.post("/events", data),
    update: (id: string, data: any) => apiClient.patch(`/events/${id}`, data),
    delete: (id: string) => apiClient.delete(`/events/${id}`),
  },

  // Notifications
  notifications: {
    getAll: () => apiClient.get("/notifications"),
    getById: (id: string) => apiClient.get(`/notifications/${id}`),
    markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.patch("/notifications/mark-all-read"),
    create: (data: any) => apiClient.post("/notifications", data),
    update: (id: string, data: any) =>
      apiClient.patch(`/notifications/${id}`, data),
    delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  },

  // Analytics
  analytics: {
    getApplications: () => apiClient.get("/analytics/applications"),
  },

  // Notes
  notes: {
    getAll: (applicationId?: string) => {
      const query = applicationId ? `?applicationId=${applicationId}` : "";
      return apiClient.get(`/notes${query}`);
    },
    getById: (id: string) => apiClient.get(`/notes/${id}`),
    create: (data: any) => apiClient.post("/notes", data),
    update: (id: string, data: any) => apiClient.patch(`/notes/${id}`, data),
    delete: (id: string) => apiClient.delete(`/notes/${id}`),
  },
};

export default apiClient;
