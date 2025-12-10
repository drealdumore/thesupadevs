"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="container max-w-md py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 p-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Admin Login
          </h1>
          <p className="text-muted-foreground mb-6">
            Sign in to manage resources
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loggingIn}>
              {loggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}