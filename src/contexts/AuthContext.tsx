import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authAPI } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  isNewUser?: boolean;
  avatar?: string;
};

type AuthOK = { success: true; data: { user: User }; message?: string };
type AuthFail = { success: false; message: string };
type AuthResult = AuthOK | AuthFail;

type AuthContextType = {
  user: User | null;
  isNewUser: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  markUserAsExisting: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AVATAR_FALLBACK =
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2';

const normalizeUser = (u: any): User => ({
  id: String(u?.id ?? u?.userId ?? 'unknown'),
  name: u?.name ?? 'User',
  email: u?.email ?? '',
  isNewUser: !!u?.isNewUser,
  avatar: u?.avatar || AVATAR_FALLBACK,
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Init from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');
      const savedIsNew = localStorage.getItem('isNewUser') === 'true';

      if (savedUser && token) {
        const parsed = normalizeUser(JSON.parse(savedUser));
        setUser(parsed);
        setIsNewUser(savedIsNew || !!parsed.isNewUser);
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isNewUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const resp = await authAPI.login(email, password);
      const u = normalizeUser(resp.data.user);

      // Persist (authAPI already stored token/user; we normalize & re-save)
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.removeItem('isNewUser');

      setUser(u);
      setIsNewUser(false);

      return { success: true, data: { user: u } };
    } catch (err: any) {
      console.error('Login error:', err);
      // keep state untouched
      return { success: false, message: err?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const resp = await authAPI.register(name, email, password);
      const u = normalizeUser({ ...resp.data.user, isNewUser: true });

      // Persist
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('isNewUser', 'true');

      setUser(u);
      setIsNewUser(true);

      return { success: true, data: { user: u } };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, message: err?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isNewUser');
      setUser(null);
      setIsNewUser(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const markUserAsExisting = () => {
    setIsNewUser(false);
    localStorage.removeItem('isNewUser');
    if (user) {
      const updated = { ...user, isNewUser: false };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const value: AuthContextType = {
    user,
    isNewUser,
    isAuthenticated: !!user && !!localStorage.getItem('auth_token'),
    isLoading,
    login,
    register,
    logout,
    updateUser,
    markUserAsExisting,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Re-export hook so imports like `from '../contexts/AuthContext'` keep working
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { AuthContext };
