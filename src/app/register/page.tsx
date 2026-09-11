"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/src/lib/auth/hooks";
import { authCredentialsSchema } from "@/src/lib/schemas/auth";
import { Button } from "@/src/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = authCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFormError(
        "Enter a valid email and a password of at least 6 characters.",
      );
      return;
    }

    register.mutate(parsed.data, {
      onSuccess: () => router.push("/"),
    });
  }

  const errorMessage = formError ?? register.error?.message;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-left"
      >
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Register
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full border-2 border-foreground bg-background p-2"
          required
        />

        <label
          className="mt-4 block text-sm font-bold uppercase"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full border-2 border-foreground bg-background p-2"
          required
        />

        {errorMessage && (
          <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
        )}

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={register.isPending}
        >
          {register.isPending ? "Creating account..." : "Register"}
        </Button>
      </form>
    </main>
  );
}
