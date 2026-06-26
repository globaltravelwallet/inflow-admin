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
  login: (email: string, password: string) => Promise<{ requiresOtp: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
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

  const applyToken = useCallback((token: string) => {
    setToken(token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ requiresOtp: boolean }> => {
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

        // Credentials were accepted — clear the client-side lockout counter.
        setFailedAttempts(0);
        setLockoutEnd(null);

        // Admin login is a two-step OTP flow: step 1 emails a code and returns
        // `requiresOtp` with no token. (When OTP is disabled server-side, a
        // token comes back immediately and we can log in right away.)
        const { token, requiresOtp } = response.data ?? {};
        if (token) {
          applyToken(token);
          router.push("/dashboard");
          return { requiresOtp: false };
        }
        return { requiresOtp: !!requiresOtp };
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
    [applyToken, failedAttempts, lockoutEnd, remainingSeconds, router]
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await api.post("/admin/auth/login/verify", {
          email,
          otp,
        });
        const { token } = response.data ?? {};
        if (!token) {
          throw new Error("Verification failed. Please try again.");
        }
        applyToken(token);
        router.push("/dashboard");
      } catch (error: unknown) {
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
        if (error instanceof Error) throw error;
        throw new Error("Invalid or expired verification code");
      } finally {
        setIsLoading(false);
      }
    },
    [applyToken, router]
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
        verifyOtp,
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
