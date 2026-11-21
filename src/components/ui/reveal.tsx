"use client";

import { useCallback, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type RevealTag = "div" | "section" | "article" | "header" | "figure" | "li" | "p" | "span";

export type RevealProps = {
  children: ReactNode;
  /** Stagger in milliseconds before the entrance starts. */
  delay?: number;
  as?: RevealTag;
  className?: string;
};

let sharedObserver: IntersectionObserver | null = null;

/** One observer for every <Reveal> on the page; each element is shown once. */
function revealObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        // Anything already scrolled past (an anchor jump skips whole sections)
        // is shown too, so scrolling back up never meets blank space.
        const scrolledPast = entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !scrolledPast) continue;
        show(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );
  return sharedObserver;
}

function show(element: Element) {
  (element as HTMLElement).dataset.shown = "true";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Reveal({ children, delay = 0, as: Element = "div", className }: RevealProps) {
  const observe = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      show(element);
      return;
    }
    const observer = revealObserver();
    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  const style = delay > 0 ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <Element ref={observe} className={cx("reveal", className)} style={style}>
      {children}
    </Element>
  );
}
