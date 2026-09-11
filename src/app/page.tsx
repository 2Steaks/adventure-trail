import { Button } from "@/src/components/ui/button";
import { LogoutButton } from "@/src/components/auth/logout-button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-full max-w-sm border-4 border-foreground bg-card p-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Dungeon Master AI
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An AI game master that turns the real world around you into an
          adventure.
        </p>
        <Button className="mt-6 w-full">Start Adventure</Button>
        <LogoutButton />
      </div>
    </main>
  );
}
