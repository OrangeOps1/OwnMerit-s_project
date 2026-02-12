"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getApiBaseUrl, setAuthState } from "@/lib/auth";

interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    group: string;
    created_at: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ownmerits.org");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Invalid login");
      }

      const data = (await response.json()) as LoginResponse;
      setAuthState(data);
      router.push(data.user.role === "admin" ? "/admin" : "/");
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Login failed: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Sign in</h1>
          <p className="text-sm text-text-secondary mb-5">
            Use demo admin account to access staff tools.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && (
              <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
            <Button fullWidth size="md" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-text-muted mt-4">
            Demo admin: `admin@ownmerits.org` / `Password123!`
          </p>
        </Card>
      </div>
    </div>
  );
}
