"use client";

import { useRouter } from "next/navigation";
import { useLogin } from "@/src/lib/auth/hooks";
import { AuthForm } from "@/src/components/auth/auth-form";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  return (
    <AuthForm
      title="Log In"
      submitLabel="Log In"
      pendingLabel="Logging in..."
      mutation={login}
      onSuccess={() => router.push("/")}
      footer={
        <a
          href="/register"
          className="mt-4 block text-center text-sm underline"
        >
          Need an account? Register
        </a>
      }
    />
  );
}
