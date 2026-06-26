"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  otpSchema,
  type LoginFormData,
  type OtpFormData,
} from "@/lib/validators";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function LoginForm() {
  const { login, verifyOtp, isLoading, rateLimitInfo } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [pendingEmail, setPendingEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    reset: resetOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { requiresOtp } = await login(data.email, data.password);
      if (requiresOtp) {
        setPendingEmail(data.email);
        setStep("otp");
        toast.success("We've emailed you a verification code");
      } else {
        toast.success("Login successful");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  const onSubmitOtp = async (data: OtpFormData) => {
    try {
      await verifyOtp(pendingEmail, data.otp);
      toast.success("Login successful");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Verification failed";
      toast.error(message);
    }
  };

  const backToCredentials = () => {
    setStep("credentials");
    setPendingEmail("");
    resetOtp();
  };

  const isLocked = rateLimitInfo.locked;

  if (step === "otp") {
    return (
      <form
        onSubmit={handleSubmitOtp(onSubmitOtp)}
        className="space-y-4 py-6"
      >
        <button
          type="button"
          onClick={backToCredentials}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-foreground">{pendingEmail}</span>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            autoFocus
            {...registerOtp("otp")}
          />
          {otpErrors.otp && (
            <p className="text-sm text-destructive">{otpErrors.otp.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2 py-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & sign in"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          autoComplete="email"
          disabled={isLocked}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLocked}
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {isLocked && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Too many failed attempts. Please try again in{" "}
          {rateLimitInfo.remainingSeconds} seconds.
        </div>
      )}

      <Button type="submit" className="w-full mt-2 py-6" disabled={isLoading || isLocked}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
