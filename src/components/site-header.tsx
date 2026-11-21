import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/content/profile";
import { AskAssistantButton } from "@/components/assistant/assistant-context";
import { MobileMenu } from "@/components/mobile-menu";
import { Monogram } from "@/components/ui/monogram";
import { pageContainer } from "@/components/ui/page-layout";
import { StatusDot } from "@/components/ui/status-dot";
import { cx } from "@/lib/cx";
import { sectionNavItems } from "@/lib/site-sections";

/** Green pill with a pinging dot; only wide screens have room for it. */
function AvailabilityStatus() {
  return (
    <p className="hidden h-8 items-center gap-2 rounded-full border border-accent/25 bg-accent/6 px-3 text-[13px] whitespace-nowrap text-foreground-soft min-[1200px]:inline-flex">
      <StatusDot />
      {profile.availability.status}
    </p>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-border-soft bg-background/82 backdrop-blur-[14px] backdrop-saturate-140">
      <div className={cx(pageContainer, "flex h-16 items-center gap-4")}>
        <a
          href="#top"
          className="inline-flex min-h-11 min-w-0 items-center gap-3 rounded-lg font-mono text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap text-foreground"
        >
          <Monogram />
          {/* The narrowest phones need the room for the buttons, so the name is left to screen readers there. */}
          <span className="truncate max-[380px]:sr-only">{profile.name}</span>
        </a>

        <nav aria-label="Sections" className="ml-auto hidden lg:block">
          <ul className="flex gap-1">
            {sectionNavItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted transition-[color,background-color] duration-200 hover:bg-muted/8 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <AvailabilityStatus />
          <AskAssistantButton>
            <Sparkle aria-hidden="true" className="size-4.5 shrink-0" />
            Ask AI
          </AskAssistantButton>
          <MobileMenu items={sectionNavItems} className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
