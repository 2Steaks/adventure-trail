"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/src/lib/auth/hooks";
import {
  authCredentialsSchema,
  type AuthCredentials,
} from "@/src/lib/schemas/auth";
import { Button } from "@/src/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
  });

  const onSubmit = (data: AuthCredentials) => {
    login.mutate(data, {
      onSuccess: () => router.push("/"),
    });
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-left"
      >
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Log In
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

        {login.error && (
          <p className="mt-4 text-sm text-destructive">
            {login.error.message}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Log In"}
        </Button>

        <a
          href="/register"
          className="mt-4 block text-center text-sm underline"
        >
          Need an account? Register
        </a>
      </form>
    </main>
  );
}
