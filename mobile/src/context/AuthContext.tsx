import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getToken, getUser, saveToken, saveUser, deleteToken, deleteUser } from '../services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = await getToken();
      const savedUser = await getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (newToken: string, newUser: User): Promise<void> => {
    await saveToken(newToken);
    await saveUser(newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async (): Promise<void> => {
    await deleteToken();
    await deleteUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
