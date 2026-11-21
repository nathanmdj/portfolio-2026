import type { ComponentProps } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cx } from "@/lib/cx";

/** A full-width suggestion row: the text on the left, an arrow that nudges forward on hover. */
export function Chip({ type = "button", className, children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cx(
        "group flex min-h-11 w-full items-center justify-between gap-2 rounded-control border border-border bg-transparent px-3 py-2 text-left text-[0.84375rem] leading-[1.4] text-foreground-soft transition-[border-color,background-color,color] duration-200 hover:border-border-strong hover:bg-surface-raised hover:text-foreground",
        className,
      )}
      {...rest}
    >
      <span className="min-w-0 break-words">{children}</span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted transition-[color,translate] duration-200 ease-settle group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </button>
  );
}
