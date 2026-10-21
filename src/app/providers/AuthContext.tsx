import React, { createContext, useContext, useState } from 'react';
import { AppUser, authenticateUser, findUserById } from '../../data/auth/users';

const SESSION_KEY = 'gfo_session_user_id';

interface AuthContextValue {
  user: AppUser | null;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mantiene la sesión del usuario. Solo se guarda el ID del usuario (nunca la contraseña)
 * para que la sesión sobreviva a una recarga de la página.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() =>
    findUserById(localStorage.getItem(SESSION_KEY))
  );

  const login = (username: string, password: string) => {
    const result = authenticateUser(username, password);
    if (!result.ok) return { ok: false, error: result.error };
    localStorage.setItem(SESSION_KEY, result.user.id);
    setUser(result.user);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}

