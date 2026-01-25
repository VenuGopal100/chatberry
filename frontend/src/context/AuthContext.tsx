import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getAuthStatus, logoutUser, userLogin, userSignup, type User } from "../helpers/api-functions";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isLoggedIn = !!user;

  async function checkAuth() {
    try {
      setLoading(true);
      const data = await getAuthStatus();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const p = userLogin({ email, password })
      .then((data) => {
        setUser(data.user);
        toast.success("Logged in");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Login failed");
        throw err;
      });

    await p;
  }

  async function signup(name: string, email: string, password: string) {
    const p = userSignup({ name, email, password })
      .then((data) => {
        setUser(data.user);
        toast.success("Account created");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Signup failed");
        throw err;
      });

    await p;
  }

  async function logout() {
    try {
      await logoutUser();
      setUser(null);
      toast.success("Logged out");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Logout failed");
    }
  }

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user, isLoggedIn, login, signup, logout, checkAuth, loading }),
    [user, isLoggedIn, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
