import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLink: string;
  children: React.ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerHref,
  footerLink,
  children,
}: AuthCardProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Vector Tasks
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link className="font-semibold text-blue-600 hover:text-blue-700" href={footerHref}>
              {footerLink}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
