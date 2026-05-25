import toast from 'react-hot-toast';

// @ts-ignore
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.genlayer.io/v1';

interface RequestOptions extends RequestInit {
  retry?: number;
  retryDelay?: number;
  skipErrorToast?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    retry = 1,
    retryDelay = 1000,
    skipErrorToast = false,
    ...fetchOptions
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new ApiError(response.status, errorBody || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error;
      if (attempt < retry) {
        await new Promise((res) => setTimeout(res, retryDelay * Math.pow(2, attempt)));
        continue;
      }
      break;
    }
  }

  // After all retries
  if (!skipErrorToast) {
    const message =
      lastError instanceof ApiError
        ? `Server error (${lastError.status}): ${lastError.message}`
        : 'Network error. Please check your connection.';
    toast.error(message);
  }

  throw lastError;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Add PUT, DELETE as needed
};
