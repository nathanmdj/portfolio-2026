import type { AnchorHTMLAttributes, ComponentProps } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg" | "icon";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex min-h-11 min-w-11 select-none items-center justify-center gap-2 rounded-control border font-sans leading-none font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,translate] duration-200 active:not-disabled:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";

/* A green fill hides the default green focus ring, so it switches to white. */
const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-accent text-on-accent shadow-accent [--focus-ring:var(--foreground)] hover:not-disabled:bg-accent-hover",
  secondary:
    "border-border-strong bg-surface text-foreground hover:not-disabled:border-muted hover:not-disabled:bg-surface-raised",
  ghost:
    "border-transparent text-accent underline-offset-4 hover:not-disabled:text-accent-hover hover:not-disabled:underline",
};

const boxedSizes: Record<ButtonSize, string> = {
  md: "px-4 text-sm",
  lg: "min-h-12 px-5 text-[0.9375rem]",
  icon: "size-11 p-0",
};

const ghostSizes: Record<ButtonSize, string> = {
  md: "px-1 text-sm",
  lg: "px-1 text-[0.9375rem]",
  icon: "size-11 p-0 text-muted hover:not-disabled:border-border hover:not-disabled:bg-surface hover:not-disabled:text-foreground hover:not-disabled:no-underline",
};

/** The single source of button styling, shared by <Button> and <ButtonLink>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleProps & { className?: string } = {}): string {
  const sizes = variant === "ghost" ? ghostSizes : boxedSizes;
  return cx(base, variants[variant], sizes[size], className);
}

export type ButtonProps = ComponentProps<"button"> &
  ButtonStyleProps & {
    /** Shows a spinner, sets aria-busy and blocks further presses. */
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading && (
        <CircleNotch aria-hidden="true" weight="bold" className="size-4 shrink-0 motion-safe:animate-spin" />
      )}
      {children}
    </button>
  );
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleProps & {
    href: string;
    /** Opens in a new tab with a safe rel and announces that to screen readers. */
    external?: boolean;
  };

export function ButtonLink({
  variant,
  size,
  external = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a className={buttonClasses({ variant, size, className })} {...externalProps} {...rest}>
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
