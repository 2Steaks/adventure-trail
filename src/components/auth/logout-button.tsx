"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/src/lib/auth/hooks";
import { Button } from "@/src/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        className="w-full"
        disabled={logout.isPending}
        onClick={() =>
          logout.mutate(undefined, {
            onSuccess: () => router.push("/login"),
          })
        }
      >
        {logout.isPending ? "Logging out..." : "Log Out"}
      </Button>
      {logout.error && (
        <p className="mt-1 text-sm text-destructive">
          {logout.error.message}
        </p>
      )}
    </div>
  );
}
