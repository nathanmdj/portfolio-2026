import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type BadgeTone = "default" | "accent";

const tones: Record<BadgeTone, string> = {
  default: "border-border bg-background-inset text-foreground-soft",
  accent: "border-accent-line bg-accent-soft text-accent",
};

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

/** A small pill caption in the mono face, e.g. a date range or a result label. */
export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
