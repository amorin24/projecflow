import { useState, useEffect } from 'react';
import { login, register, getCurrentUser } from '../lib/api';
import { User, RegisterRequest } from '../lib/types';
import { getErrorMessage } from '../utils/errorUtils';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await getCurrentUser();
      const data = res.data as { user: User };
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed',
      });
    }
  };

  const loginUser = async (email: string, password: string) => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      const res = await login(email, password);
      const data = res.data as { token: string; user: User };
      localStorage.setItem('token', data.token);
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setAuthState({
        ...authState,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  };

  const registerUser = async (userData: RegisterRequest) => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      const res = await register(userData);
      const data = res.data as { token: string; user: User };
      localStorage.setItem('token', data.token);
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setAuthState({
        ...authState,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...authState,
    loginUser,
    registerUser,
    logout,
    loadUser,
  };
};
