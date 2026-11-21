import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRight,
  CheckCircle,
  EnvelopeSimple,
  GithubLogo,
  Globe,
  LinkedinLogo,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { AskAssistantButton } from "@/components/assistant/assistant-context";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ctaRow, pageContainer, sectionPadding } from "@/components/ui/page-layout";
import { Reveal } from "@/components/ui/reveal";
import { SectionEyebrow } from "@/components/ui/section";
import { closingLine, profile } from "@/content/profile";
import { cx } from "@/lib/cx";
import { sectionHeading } from "@/lib/site-sections";

type ContactLink = { label: string; href: string; external: boolean; icon: Icon };

/** Email, GitHub and LinkedIn are optional in the profile; empty ones are left out. */
function secondaryContactLinks(): ContactLink[] {
  const { email, github, linkedin } = profile.links;
  const candidates: (ContactLink | null)[] = [
    email ? { label: "Email", href: `mailto:${email}`, external: false, icon: EnvelopeSimple } : null,
    github ? { label: "GitHub", href: github, external: true, icon: GithubLogo } : null,
    linkedin ? { label: "LinkedIn", href: linkedin, external: true, icon: LinkedinLogo } : null,
  ];
  return candidates.filter((link): link is ContactLink => link !== null);
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** "Open to new work — more than 30 hrs/week, full-time, and comfortable working async…" */
function availabilitySentence(): string {
  const { status, hours, capacity, overlap } = profile.availability;
  return `${status} — ${lowerFirst(hours)}, ${lowerFirst(capacity)}, and ${lowerFirst(overlap)}.`;
}

export function Contact() {
  const { id, index, label } = sectionHeading("contact");
  const headingId = `${id}-title`;
  const { location, availability, verification } = profile;
  const links = secondaryContactLinks();
  const facts: { term: string; detail: string; icon: Icon }[] = [
    { term: "Status", detail: availability.status, icon: CheckCircle },
    { term: "Time zone", detail: `${location.timezone} · ${lowerFirst(availability.overlap)}`, icon: Globe },
    { term: "Verification", detail: verification, icon: ShieldCheck },
  ];

  return (
    // No top padding: the panel follows straight on from the fit check above it.
    <section id={id} aria-labelledby={headingId}>
      <div className={cx(pageContainer, sectionPadding.bottom)}>
        <Reveal>
          <Card className="grid grid-cols-1 items-center gap-8 bg-[radial-gradient(60%_120%_at_100%_0%,rgb(34_197_94/0.12),transparent_60%)] py-8 sm:gap-12 sm:p-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-16">
            <div className="min-w-0">
              <SectionEyebrow index={index}>{label}</SectionEyebrow>
              <h2
                id={headingId}
                className="mt-4 text-[clamp(1.625rem,2.8vw,2.25rem)] leading-[1.2] break-words"
              >
                {closingLine}
              </h2>
              <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.6] text-muted">
                {availabilitySentence()}
              </p>
              <div className={cx(ctaRow, "mt-8")}>
                <ButtonLink href={profile.links.upwork} external size="lg">
                  Hire me on Upwork
                  <ArrowUpRight aria-hidden="true" className="size-4.5 shrink-0" />
                </ButtonLink>
                <AskAssistantButton variant="secondary" size="lg">
                  <Sparkle aria-hidden="true" className="size-4.5 shrink-0" />
                  Ask my AI anything
                </AskAssistantButton>
              </div>
              {links.length > 0 && (
                <ul aria-label="Other ways to reach me" className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
                  {links.map(({ label: linkLabel, href, external, icon: LinkIcon }) => (
                    <li key={linkLabel}>
                      <ButtonLink href={href} variant="ghost" external={external}>
                        <LinkIcon aria-hidden="true" className="size-4 shrink-0" />
                        {linkLabel}
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border">
              {facts.map(({ term, detail, icon: FactIcon }) => (
                <div key={term} className="relative bg-background-inset py-4 pr-5 pl-[52px]">
                  <dt className="font-mono text-[0.75rem] text-muted">
                    <FactIcon aria-hidden="true" className="absolute top-[18px] left-5 size-[18px] text-accent" />
                    {term}
                  </dt>
                  <dd className="mt-0.5 text-[0.9375rem] text-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
