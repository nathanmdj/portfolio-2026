import { profile } from "@/content/profile";
import { cx } from "@/lib/cx";

const sizes = {
  md: "size-9 text-[13px]",
  sm: "size-8 text-xs",
} as const;

/** The initials mark used in the site header and the assistant panel. */
export function Monogram({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "grid shrink-0 place-items-center rounded-control border border-border-strong bg-[linear-gradient(180deg,var(--border-soft),#151d2f)] font-mono font-bold tracking-normal text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]",
        sizes[size],
        className,
      )}
    >
      {profile.initials}
    </span>
  );
}
