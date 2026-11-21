import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type TagTone = "default" | "accent" | "muted";

const tones: Record<TagTone, string> = {
  default: "border-border bg-surface-raised text-foreground-soft",
  accent: "border-accent-line bg-accent-soft text-accent",
  muted: "border-border bg-transparent text-muted",
};

export type TagProps = {
  children: ReactNode;
  tone?: TagTone;
  /** Use "li" when the tags sit inside a <ul>. */
  as?: "span" | "li";
  className?: string;
};

export function Tag({ children, tone = "default", as: Element = "span", className }: TagProps) {
  return (
    <Element
      className={cx(
        "inline-flex max-w-full items-center rounded-md border px-2 py-1 font-mono text-xs leading-[1.4]",
        tones[tone],
        className,
      )}
    >
      {children}
    </Element>
  );
}
