"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api";
import { FieldErrors } from "@/types/task";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});
    setSubmitting(true);
    try {
      await login(fields.email, fields.password);
      router.replace("/tasks");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields ?? {});
        setMessage(error.message);
      } else {
        setMessage("Unable to sign in right now.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your personal task queue."
      footerText="Need an account?"
      footerHref="/signup"
      footerLink="Create one"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {message && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(event) => setFields({ ...fields, email: event.target.value })}
          />
          <FieldError message={errors.email} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={fields.password}
            onChange={(event) => setFields({ ...fields, password: event.target.value })}
          />
          <FieldError message={errors.password} />
        </div>
        <Button className="w-full" disabled={submitting} type="submit">
          <AppIcon className={submitting ? "animate-spin" : ""} name={submitting ? "loader" : "login"} size={16} />
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
