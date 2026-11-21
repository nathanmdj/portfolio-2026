import { cx } from "@/lib/cx";

export type FieldStyleProps = {
  /** Paints the border and focus halo red while the value needs fixing. */
  invalid?: boolean;
  className?: string;
};

/**
 * Text inputs sit on the inset background. While focused they swap the
 * outline for a coloured border and a soft halo of the same colour.
 */
export function fieldClasses({ invalid = false, className }: FieldStyleProps = {}): string {
  return cx(
    "rounded-control border bg-background-inset font-sans text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:outline-hidden",
    invalid
      ? "border-danger focus:shadow-[0_0_0_3px_rgb(248_113_113/0.2)]"
      : "border-border focus:border-accent focus:shadow-[0_0_0_3px_rgb(34_197_94/0.2)]",
    className,
  );
}
