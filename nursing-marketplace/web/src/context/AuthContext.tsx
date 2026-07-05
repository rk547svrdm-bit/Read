import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, setToken } from "../api/client";
import type { AuthUser, Role } from "../api/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    role: Role;
    displayName: string;
    city?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "nm_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  function persist(nextUser: AuthUser, token: string) {
    setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  async function login(email: string, password: string) {
    const result = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
      email,
      password,
    });
    persist(result.user, result.token);
  }

  async function register(input: {
    email: string;
    password: string;
    role: Role;
    displayName: string;
    city?: string;
  }) {
    const result = await api.post<{ token: string; user: AuthUser }>("/auth/register", input);
    persist(result.user, result.token);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro AuthProvider");
  return ctx;
}
