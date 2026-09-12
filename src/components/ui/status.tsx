import { Button } from "@/src/components/ui/button";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-2 border-foreground bg-card p-4 text-sm font-bold uppercase"
    >
      <span
        aria-hidden="true"
        className="size-2 motion-safe:animate-pulse bg-foreground"
      />
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="border-2 border-destructive bg-card p-4 text-left"
    >
      <p className="text-sm font-bold uppercase text-destructive">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
