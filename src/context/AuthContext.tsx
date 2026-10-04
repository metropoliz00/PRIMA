import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import {
  getCurrentUser,
  authenticateUser,
  logoutUser,
  getStoredUsers,
  syncUsersWithGAS,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => void;
  usersList: User[];
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    const active = getCurrentUser();
    setUser(active);
    setUsersList(getStoredUsers());
    setIsLoading(false);

    // Sync with remote Google Sheets database
    syncUsersWithGAS().then((synced) => {
      setUsersList(synced);
    });
  }, []);

  const refreshUsers = () => {
    setUsersList(getStoredUsers());
    syncUsersWithGAS().then((synced) => {
      setUsersList(synced);
    });
  };

  const login = async (usernameInput: string, passwordInput: string) => {
    setIsLoading(true);
    // Simulate short network delay for smooth user feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = authenticateUser(usernameInput, passwordInput);
    setIsLoading(false);

    if (result.user) {
      setUser(result.user);
      return { success: true, role: result.user.role };
    } else {
      return { success: false, error: result.error || 'Username atau password tidak sesuai.' };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        usersList,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
