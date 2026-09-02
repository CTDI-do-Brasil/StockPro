import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface DatabaseStatus {
  connected: boolean;
  host?: string;
  database?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  dbStatus: DatabaseStatus | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshDbStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'tech_inv_auth_token';
const USER_KEY = 'tech_inv_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Verificar status da conexão com o banco de dados PostgreSQL
  const refreshDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.database);
      }
    } catch {
      setDbStatus({ connected: false });
    }
  }, []);

  // Verificar validade do token ao carregar aplicação
  useEffect(() => {
    const verifyUser = async () => {
      await refreshDbStatus();

      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          } else {
            // Token inválido/expirado
            logout();
          }
        } catch {
          // Se a API estiver offline, mantém os dados cacheados locais
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token, refreshDbStatus]);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao realizar login.' };
      }

      const authData = data as AuthResponse;
      setUser(authData.user);
      setToken(authData.token);
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
      await refreshDbStatus();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Falha de comunicação com o servidor. Verifique se o backend está em execução.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        return { success: false, error: resData.error || 'Erro ao registrar usuário.' };
      }

      const authData = resData as AuthResponse;
      setUser(authData.user);
      setToken(authData.token);
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
      await refreshDbStatus();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Falha de comunicação com o servidor ao cadastrar.' };
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Usuário não autenticado.' };

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        return { success: false, error: resData.error || 'Erro ao atualizar perfil.' };
      }

      setUser(resData.user);
      if (resData.token) {
        setToken(resData.token);
        localStorage.setItem(TOKEN_KEY, resData.token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(resData.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Falha de conexão com o servidor.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        dbStatus,
        login,
        register,
        updateProfile,
        logout,
        refreshDbStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
