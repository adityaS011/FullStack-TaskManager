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

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});
    setSubmitting(true);
    try {
      await signup(fields.name, fields.email, fields.password);
      router.replace("/tasks");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields ?? {});
        setMessage(error.message);
      } else {
        setMessage("Unable to create the account right now.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Start with a secure account and a private task workspace."
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {message && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            value={fields.name}
            onChange={(event) => setFields({ ...fields, name: event.target.value })}
          />
          <FieldError message={errors.name} />
        </div>
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
            autoComplete="new-password"
            value={fields.password}
            onChange={(event) => setFields({ ...fields, password: event.target.value })}
          />
          <FieldError message={errors.password} />
        </div>
        <Button className="w-full" disabled={submitting} type="submit">
          <AppIcon className={submitting ? "animate-spin" : ""} name={submitting ? "loader" : "user-plus"} size={16} />
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
