"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  email: string;
  password: string;
  loggingIn: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  email,
  password,
  loggingIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container flex min-h-[calc(100vh-70px)] max-w-md items-center py-16">
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <span
            aria-hidden="true"
            className="mb-5 inline-flex h-11 w-11 rotate-3 items-center justify-center rounded-xl bg-foreground font-heading text-2xl font-extrabold leading-none text-background"
          >
            /
          </span>
          <h1 className="mb-1 font-heading text-3xl font-bold tracking-tight">
            Admin sign in
          </h1>
          <p className="mb-6 text-muted-foreground">
            Sign in to manage resources.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-11"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 rounded-full"
              disabled={loggingIn}
            >
              {loggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
              {loggingIn ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}