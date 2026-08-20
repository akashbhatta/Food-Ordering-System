"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UtensilsCrossed, Lock, Mail, User, Phone, ArrowRight, Loader2, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/server/actions/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "OWNER" ? "OWNER" : "CUSTOMER";

  const [role, setRole] = React.useState<"CUSTOMER" | "OWNER">(defaultRole);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      // Format phone with +977 prefix if entered as 10 digits
      let fullPhone = phone.trim();
      if (fullPhone && !fullPhone.startsWith("+")) {
        fullPhone = `+977 ${fullPhone}`;
      }

      const result = await registerUser({
        name,
        email,
        phone: fullPhone || undefined,
        password,
        role,
      });

      if (!result.success) {
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        toast.error(result.message || "Registration failed. Please review your inputs.");
        return;
      }

      toast.success("Account created successfully! You can now sign in.");
      router.push(`/login?registered=true&email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            Create an Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join FeastHub to order authentic food or list your restaurant
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-border/60 shadow-xl rounded-3xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-lg">Select Your Account Type</CardTitle>
            
            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  role === "CUSTOMER"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                )}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs">Food Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  role === "OWNER"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                )}
              >
                <Store className="h-5 w-5" />
                <span className="text-xs">Restaurant Owner</span>
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Pasang Sherpa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
                )}
              </div>

              {/* Phone with Nepal Code Prefix */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number (Nepal)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 h-10 rounded-xl border border-input bg-muted/60 text-xs font-bold text-foreground shrink-0 select-none">
                    <span>🇳🇵</span>
                    <span>+977</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2 mt-4 rounded-xl font-bold shadow-md" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/40 pt-4 text-center text-sm">
            <div className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
