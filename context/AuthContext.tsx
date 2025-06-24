import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import * as authService from '../services/authService';
import { UserProfile } from '../types'; // Assuming this type exists and is relevant

// Define the shape of the user object we might store in context
// This could be from the decoded token or fetched from /api/me
type AuthUser = Omit<UserProfile, 'passwordHash' | 'feedback' | 'fitnessGoal' | 'experienceLevel' | 'age' | 'gender' | 'height' | 'weight' > & { id: string } ; // Or a more specific type based on token/API response


interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null; // User object from token or API
  token: string | null;
  isLoading: boolean; // For initial loading of auth state
  login: (token: string, userData?: AuthUser) => Promise<void>; // userData is optional if we fetch after login
  logout: () => void;
  register: (data: authService.RegisterData) => Promise<any>; // Kept register here for convenience if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True initially while checking stored token

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedToken = authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          // Option 1: Decode token client-side (quick, less secure for full user object)
          // const decodedUser = authService.getCurrentUserFromToken();
          // if (decodedUser) setUser({id: decodedUser.userId, email: decodedUser.email});

          // Option 2: Fetch user profile from backend (more secure, up-to-date)
          const profile = await authService.getMyProfile(); // getMyProfile should use the stored token
          setUser({id: profile.id, email: profile.email}); // Adapt based on UserProfile and AuthUser types
        } catch (error) {
          console.error("Failed to fetch user profile with stored token, logging out:", error);
          authService.logout(); // Token might be invalid or expired
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (newToken: string, userData?: AuthUser) => {
    authService.logout(); // Clear any old session first
    localStorage.setItem('authToken', newToken); // authService.login already does this, but good to be sure
    setToken(newToken);
    if (userData) {
      setUser(userData);
    } else {
      // If userData is not passed, fetch it
      try {
        setIsLoading(true);
        const profile = await authService.getMyProfile(); // Uses the new token implicitly via getToken in service
        setUser({id: profile.id, email: profile.email}); // Adapt
      } catch (error) {
        console.error("Failed to fetch user profile after login:", error);
        // Token is set, but user data fetch failed. Handle as appropriate.
        // Potentially logout or leave user as null but token set.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    // Optionally: redirect to login page or home page
    // window.location.href = '/login';
  };

  // Register function (optional to include in context, could be called directly from component)
  // This doesn't directly change auth state here as login is a separate step
  const register = async (data: authService.RegisterData) => {
      return authService.register(data);
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
