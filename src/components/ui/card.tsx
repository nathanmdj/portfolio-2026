import type { ComponentProps, ElementType } from "react";
import { cx } from "@/lib/cx";

export type CardProps = ComponentProps<"div"> & {
  as?: ElementType;
  /** Lifts slightly and strengthens its border on hover. */
  interactive?: boolean;
  /** Green-edged variant for work below the usual stack floor. */
  deep?: boolean;
};

export function Card({ as: Element = "div", interactive = false, deep = false, className, ...rest }: CardProps) {
  return (
    <Element
      className={cx(
        "relative rounded-card border bg-surface p-6 shadow-card transition-[border-color,background-color,translate] duration-200 ease-settle",
        deep
          ? "border-accent-line bg-[linear-gradient(180deg,rgb(34_197_94/0.06),rgb(34_197_94/0)_40%)]"
          : "border-border",
        interactive && "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        interactive && (deep ? "hover:border-accent/55" : "hover:border-border-strong"),
        className,
      )}
      {...rest}
    />
  );
}
