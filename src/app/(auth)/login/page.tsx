"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UtensilsCrossed, Lock, Mail, ArrowRight, Loader2, KeyRound, Sparkles, User, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loginUser } from "@/server/actions/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser({ email, password });

      if (!result.success) {
        setError(result.message || "Failed to sign in. Check your credentials.");
        toast.error(result.message || "Sign in failed");
        return;
      }

      toast.success("Welcome back! Signed in successfully.");

      // Route based on role or callback URL
      if (callbackUrl && callbackUrl !== "/") {
        router.push(callbackUrl);
      } else if (result.data?.role === "ADMIN") {
        router.push("/admin");
      } else if (result.data?.role === "OWNER") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for quick testing during development
  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-2">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your orders, kitchen dashboard, or admin portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Sign In with Email</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-border/40 pt-4 text-center text-sm">
            <div className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Development Quick-Fill Bar */}
        <div className="p-4 rounded-xl border border-border/60 bg-muted/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              Dev Quick Fill (Password: password123)
            </span>
            <Badge variant="outline" className="text-[10px]">Testing</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2 gap-1 justify-center rounded-xl"
              onClick={() => handleQuickFill("alice@example.com")}
            >
              <User className="h-3 w-3 text-amber-500" />
              Customer
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2 gap-1 justify-center rounded-xl"
              onClick={() => handleQuickFill("pasang@himalayanmomo.com")}
            >
              <Store className="h-3 w-3 text-emerald-500" />
              Momo Owner
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2 gap-1 justify-center rounded-xl"
              onClick={() => handleQuickFill("mario@luigispizza.com")}
            >
              <Store className="h-3 w-3 text-blue-500" />
              Pizza Owner
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2 gap-1 justify-center rounded-xl"
              onClick={() => handleQuickFill("admin@feasthub.com")}
            >
              <Shield className="h-3 w-3 text-purple-500" />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
