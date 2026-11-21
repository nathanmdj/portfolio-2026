import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cx } from "@/lib/cx";
import { Button } from "./button";

export type RequestFailedNoticeProps = {
  message: string;
  onRetry: () => void;
  className?: string;
};

/** A failed assistant request, stated plainly with a way to try again. */
export function RequestFailedNotice({ message, onRetry, className }: RequestFailedNoticeProps) {
  return (
    <div
      className={cx(
        "grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-control border border-danger/35 bg-danger/10 p-4",
        className,
      )}
    >
      <WarningCircle aria-hidden="true" className="mt-0.5 size-5 text-danger" />
      <div className="min-w-0">
        <p className="text-[0.9375rem] font-semibold text-danger">Something went wrong</p>
        <p className="mt-0.5 text-sm leading-relaxed break-words text-foreground-soft">{message}</p>
        <Button variant="secondary" onClick={onRetry} className="mt-3">
          <ArrowClockwise aria-hidden="true" className="size-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}
