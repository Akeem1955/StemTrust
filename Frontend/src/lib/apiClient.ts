/**
 * Base API Client
 * 
 * This is the foundation for all API calls in the application.
 * When moving to production:
 * 1. Update VITE_API_BASE_URL in .env
 * 2. Add authentication headers
 * 3. Enable real error tracking
 * 
 * No other changes needed in the rest of the codebase!
 */

// Environment-based configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const USE_MOCK_DELAY = import.meta.env.VITE_USE_MOCK_DELAY !== 'false'; // Default true
const MOCK_DELAY_MS = parseInt(import.meta.env.VITE_MOCK_DELAY_MS || '800');
const ENABLE_API_LOGGING = import.meta.env.VITE_ENABLE_API_LOGGING !== 'false'; // Default true

/**
 * API Response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Simulate network delay for mock API
 */
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Log API calls (development only)
 */
const logApiCall = (method: string, url: string, data?: any) => {
  if (ENABLE_API_LOGGING) {
    console.group(`[API] ${method} ${url}`);
    console.log('Base URL:', API_BASE_URL);
    if (data) console.log('Request Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  logApiCall(method, endpoint, options.body);

  // Simulate network delay in development
  if (USE_MOCK_DELAY && MOCK_DELAY_MS > 0) {
    await simulateDelay(MOCK_DELAY_MS);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Parse response
    const data = await response.json();

    // Handle API error responses
    if (!response.ok) {
      throw new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An error occurred',
        response.status,
        data.error?.details
      );
    }

    // Return data from successful response
    return data.data || data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'NETWORK_ERROR',
        'Unable to connect to the server. Please check your internet connection.',
        0
      );
    }

    // Handle other errors
    throw new ApiError(
      'UNKNOWN_ERROR',
      error instanceof Error ? error.message : 'An unknown error occurred',
      0
    );
  }
}

/**
 * HTTP GET request
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  
  return apiFetch<T>(endpoint + queryString, {
    method: 'GET',
  });
}

/**
 * HTTP POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * HTTP PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * HTTP PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * HTTP DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
  });
}

/**
 * Upload file
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  logApiCall('POST (Upload)', endpoint, { fileCount: formData.getAll('files').length });

  if (USE_MOCK_DELAY && MOCK_DELAY_MS > 0) {
    await simulateDelay(MOCK_DELAY_MS);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type for FormData - browser will set it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.code || 'UPLOAD_ERROR',
        data.error?.message || 'Upload failed',
        response.status,
        data.error?.details
      );
    }

    return data.data || data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'UPLOAD_ERROR',
      error instanceof Error ? error.message : 'Upload failed',
      0
    );
  }
}

/**
 * Get API configuration (useful for debugging)
 */
export function getApiConfig() {
  return {
    baseUrl: API_BASE_URL,
    useMockDelay: USE_MOCK_DELAY,
    mockDelayMs: MOCK_DELAY_MS,
    enableLogging: ENABLE_API_LOGGING,
  };
}

/**
 * Health check endpoint
 */
export async function checkApiHealth(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
  try {
    return await apiGet('/health');
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
    };
  }
}
