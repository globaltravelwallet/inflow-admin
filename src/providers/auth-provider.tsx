"use client";

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { setToken, clearToken, getToken } from "@/lib/auth";
import type { AdminUser } from "@/types/auth";

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  rateLimitInfo: { locked: boolean; remainingSeconds: number };
}

export const AuthContext = createContext<AuthContextType | null>(null);

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        });
      } catch {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!lockoutEnd) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutEnd(null);
        setRemainingSeconds(0);
        setFailedAttempts(0);
      } else {
        setRemainingSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (lockoutEnd && Date.now() < lockoutEnd) {
        throw new Error(
          `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`
        );
      }

      setIsLoading(true);
      try {
        const response = await api.post("/admin/auth/login", {
          email,
          password,
        });
        const { token } = response.data;
        setToken(token);

        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        });
        setFailedAttempts(0);
        setLockoutEnd(null);
        router.push("/dashboard");
      } catch (error: unknown) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          const end = Date.now() + LOCKOUT_DURATION * 1000;
          setLockoutEnd(end);
          setRemainingSeconds(LOCKOUT_DURATION);
          throw new Error(
            `Too many failed attempts. Account locked for ${LOCKOUT_DURATION} seconds.`
          );
        }

        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        ) {
          throw new Error(
            (error as { response: { data: { message: string } } }).response.data
              .message
          );
        }
        throw new Error("Invalid email or password");
      } finally {
        setIsLoading(false);
      }
    },
    [failedAttempts, lockoutEnd, remainingSeconds, router]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        rateLimitInfo: {
          locked: !!lockoutEnd && Date.now() < lockoutEnd,
          remainingSeconds,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
