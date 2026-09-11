"use client";

import type { ReactNode } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  authCredentialsSchema,
  type AuthCredentials,
} from "@/src/lib/schemas/auth";
import { Button } from "@/src/components/ui/button";

export function AuthForm({
  title,
  submitLabel,
  pendingLabel,
  mutation,
  onSuccess,
  footer,
}: {
  title: string;
  submitLabel: string;
  pendingLabel: string;
  mutation: UseMutationResult<unknown, Error, AuthCredentials>;
  onSuccess: () => void;
  footer?: ReactNode;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
  });

  const onSubmit = (data: AuthCredentials) => {
    mutation.mutate(data, { onSuccess });
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-left"
      >
        <h1 className="text-2xl font-black uppercase tracking-wide">
          {title}
        </h1>

        <label
          className="mt-4 block text-sm font-bold uppercase"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="mt-1 w-full border-2 border-foreground bg-background p-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}

        <label
          className="mt-4 block text-sm font-bold uppercase"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="mt-1 w-full border-2 border-foreground bg-background p-2"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">
            {errors.password.message}
          </p>
        )}

        {mutation.error && (
          <p className="mt-4 text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? pendingLabel : submitLabel}
        </Button>

        {footer}
      </form>
    </main>
  );
}
