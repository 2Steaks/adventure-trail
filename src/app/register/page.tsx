"use client";

import { useRouter } from "next/navigation";
import { useRegister } from "@/src/features/auth/hooks";
import { AuthForm } from "@/src/components/auth/auth-form";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  return (
    <AuthForm
      title="Register"
      submitLabel="Register"
      pendingLabel="Creating account..."
      mutation={register}
      onSuccess={() => router.push("/")}
    />
  );
}
