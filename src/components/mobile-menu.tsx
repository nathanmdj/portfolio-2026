"use client";

import { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import type { SectionNavItem } from "@/lib/site-sections";

const MENU_ID = "site-menu";

type MobileMenuProps = {
  items: readonly SectionNavItem[];
  /** Applied to both the button and the panel, e.g. to hide them on wide screens. */
  className?: string;
};

/**
 * The small-screen section menu: its toggle button and the panel it opens.
 * The panel drops full width from the bottom edge of the nearest positioned
 * ancestor, the sticky header.
 */
export function MobileMenu({ items, className }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    // The open menu covers page content, so a tap anywhere outside dismisses it.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen((current) => !current)}
        className={className}
      >
        {open ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <List aria-hidden="true" className="size-5" />
        )}
      </Button>

      <div
        ref={panelRef}
        id={MENU_ID}
        hidden={!open}
        className={cx(
          "absolute inset-x-0 top-full border-b border-border bg-background px-4 pt-2 pb-4 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.8)] sm:px-8",
          className,
        )}
      >
        <nav aria-label="Sections">
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-base font-medium text-muted transition-[color,background-color] duration-200 hover:bg-muted/8 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
