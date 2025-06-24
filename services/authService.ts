import axios from 'axios';
import { UserProfile } from '../types'; // Assuming UserProfile type might be relevant for user object

// Define the base URL for the backend API
// It's good practice to make this configurable, e.g., via environment variables for the frontend
// For now, we'll hardcode it based on the backend server's default port
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4242/api';

const AUTH_TOKEN_KEY = 'authToken';

interface AuthResponse {
  message: string;
  token: string;
  user: Omit<UserProfile, 'passwordHash'>; // Assuming backend returns user info without hash
}

interface RegisterData {
  email: string;
  password_plaintext: string; // Ensure backend expects 'password'
}

interface LoginData {
  email: string;
  password_plaintext: string; // Ensure backend expects 'password'
}

/**
 * Registers a new user.
 * @param data - User registration data (email, password).
 * @returns Promise resolving to the backend's response.
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
    email: data.email,
    password: data.password_plaintext // Backend expects 'password'
  });
  // If registration is successful and returns a token (some register endpoints do), store it.
  // Based on our current backend, register returns user info but not a token directly.
  // Login is required to get a token.
  return response.data;
};

/**
 * Logs in an existing user.
 * @param data - User login data (email, password).
 * @returns Promise resolving to the backend's response containing the token.
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
    email: data.email,
    password: data.password_plaintext // Backend expects 'password'
  });
  if (response.data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
  }
  return response.data;
};

/**
 * Logs out the current user by removing the auth token.
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  // Optionally, could also call a backend /auth/logout endpoint if it exists
  // to invalidate the token on the server-side (more secure for some JWT strategies).
};

/**
 * Retrieves the stored authentication token.
 * @returns The auth token string or null if not found.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Checks if a user is currently authenticated (i.e., a token exists).
 * Does not validate the token's expiry or validity against the backend.
 * @returns True if a token exists, false otherwise.
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Retrieves user information from a stored JWT.
 * This is a basic implementation that decodes the token.
 * WARNING: This does not verify the token signature or expiry.
 * For actual user data, always prefer fetching from a protected backend endpoint.
 * @returns Decoded user object from token or null if no token or decode error.
 */
export const getCurrentUserFromToken = (): { userId: string; email: string } | null => {
  const token = getToken();
  if (!token) {
    return null;
  }
  try {
    // Basic JWT decoding (payload is the second part)
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
      // Add other fields from token payload if present
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    // Invalid token or error during decoding, remove it
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
};

/**
 * Fetches the current user's profile from the protected backend /me route.
 * This is the recommended way to get up-to-date user information.
 * @returns Promise resolving to the user profile.
 */
export const getMyProfile = async (): Promise<Omit<UserProfile, 'passwordHash'>> => {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found.');
    }
    const response = await axios.get<{ user: Omit<UserProfile, 'passwordHash'> }>(`${API_BASE_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.user;
};

// Create an Axios instance for API calls that require authentication
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update getMyProfile to use the apiClient instance
export const getMyProfile = async (): Promise<Omit<UserProfile, 'passwordHash'>> => {
    // No need to manually get token and set header if using apiClient
    // const token = getToken();
    // if (!token) {
    //     throw new Error('No authentication token found.');
    // }
    const response = await apiClient.get<{ user: Omit<UserProfile, 'passwordHash'> }>(`/me`);
    // The apiClient instance automatically adds the Authorization header.
    // headers: {
    //     Authorization: `Bearer ${token}`,
    // },
    return response.data.user;
};
