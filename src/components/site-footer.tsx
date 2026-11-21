import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { pageContainer } from "@/components/ui/page-layout";
import { profile } from "@/content/profile";
import { cx } from "@/lib/cx";

export function SiteFooter() {
  const { name, title, location, links } = profile;
  return (
    <footer className="border-t border-border-soft text-sm text-muted">
      {/* The extra room below keeps the Upwork link clear of the fixed assistant launcher. */}
      <div className={cx(pageContainer, "flex flex-wrap items-center justify-between gap-4 pt-8 pb-28")}>
        <p>
          {name} <span aria-hidden="true">·</span>
          <span className="sr-only">,</span> {title} <span aria-hidden="true">·</span>
          <span className="sr-only">,</span> {location.city}, {location.country}
        </p>
        <a
          href={links.upwork}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-foreground-soft no-underline transition-colors duration-200 hover:text-accent"
        >
          Upwork profile
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
