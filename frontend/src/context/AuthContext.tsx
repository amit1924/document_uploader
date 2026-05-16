import {
  createContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    setUser,
    setAccessToken,
    initialize,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch {
          storeLogout();
        }
      }
      initialize();
    };
    initAuth();
  }, [initialize, setUser, storeLogout]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await authApi.login({ email, password });
        storeLogin(response.user, response.accessToken);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [storeLogin, setLoading]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const response = await authApi.register({ name, email, password });
        storeLogin(response.user, response.accessToken);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [storeLogin, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // continue logout even if API fails
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  const updateProfile = useCallback(
    async (payload: Partial<Pick<User, 'name' | 'avatar'>>) => {
      const updatedUser = await authApi.updateProfile(payload);
      setUser(updatedUser);
      return updatedUser;
    },
    [setUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
