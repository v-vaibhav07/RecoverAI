import { AlertCircle } from "lucide-react";
import Button from "../common/Button";

export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
        <AlertCircle size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">Couldn't load this</p>
        <p className="mt-1 max-w-sm text-xs text-text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
