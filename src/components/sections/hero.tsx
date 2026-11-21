import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkle,
  Translate,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import { profile, roles, type Role } from "@/content/profile";
import { AskAssistantButton } from "@/components/assistant/assistant-context";
import { HeroNetwork } from "@/components/hero-network";
import { ButtonLink } from "@/components/ui/button";
import { ctaRow, pageContainer } from "@/components/ui/page-layout";
import { cx } from "@/lib/cx";
import { isFieldRole } from "@/lib/roles";

/** Sets the part of the headline that carries the positioning in the accent colour. */
function Headline({ text, emphasis }: { text: string; emphasis: string }) {
  const start = text.indexOf(emphasis);
  if (start === -1) return <>{text}</>;
  const end = start + emphasis.length;
  return (
    <>
      {text.slice(0, start)}
      <em className="text-accent not-italic">{text.slice(start, end)}</em>
      {text.slice(end)}
    </>
  );
}

function RoleLine() {
  return (
    <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full border border-border bg-surface/75 px-3.5 py-2 font-mono text-[13px] font-medium text-foreground-soft max-sm:rounded-xl">
      <span className="text-foreground">{profile.title}</span>
      <span aria-hidden="true" className="h-3.5 w-px bg-border-strong max-sm:hidden" />
      <span className="sr-only">: </span>
      <span>
        {profile.focus.map((item, index) => (
          <span key={item}>
            {index > 0 && (
              <>
                <span aria-hidden="true"> · </span>
                <span className="sr-only">, </span>
              </>
            )}
            {item}
          </span>
        ))}
      </span>
    </p>
  );
}

type GlanceItem = { label: string; icon: Icon; role: Role | undefined; detail: (role: Role) => string };

/** The two roles running right now: the product job and the network in the field. */
const glanceItems: GlanceItem[] = [
  {
    label: "Currently",
    icon: Briefcase,
    role: roles.find((role) => role.current && !isFieldRole(role)),
    detail: (role) => role.org,
  },
  {
    label: "In the field",
    icon: WifiHigh,
    role: roles.find((role) => role.current && isFieldRole(role)),
    detail: (role) => (isFieldRole(role) ? `${role.org}, ${role.site}` : role.org),
  },
];

function AtAGlance() {
  return (
    <aside aria-label="At a glance" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {glanceItems.map(({ label, icon: GlanceIcon, role, detail }) =>
        role ? (
          <div
            key={label}
            className="rounded-card border border-border bg-surface/78 p-5 shadow-card backdrop-blur-[10px]"
          >
            <p className="flex items-center gap-2 font-mono text-xs leading-[1.6] font-medium text-muted">
              <GlanceIcon aria-hidden="true" className="size-4 shrink-0 text-accent" />
              {label}
            </p>
            <p className="mt-3 text-[15px] leading-[1.4] font-semibold text-foreground">{role.title}</p>
            <p className="mt-0.5 text-sm leading-[1.6] text-muted">{detail(role)}</p>
          </div>
        ) : null,
      )}
    </aside>
  );
}

type Fact = { term: string; icon: Icon; value: ReactNode; notes?: readonly string[] };

const [firstLanguage, ...otherLanguages] = profile.languages.map(
  (language) => `${language.name} (${language.level})`,
);

const facts: Fact[] = [
  {
    term: "Location",
    icon: MapPin,
    value: `Based in ${profile.location.city}, ${profile.location.country}`,
    notes: [profile.location.timezone],
  },
  {
    term: "Availability",
    icon: Clock,
    value: profile.availability.hours,
    notes: [profile.availability.capacity],
  },
  { term: "Languages", icon: Translate, value: firstLanguage, notes: otherLanguages },
  { term: "Verification", icon: ShieldCheck, value: profile.verification },
];

function FactList() {
  return (
    <dl className="mt-12 grid gap-px overflow-hidden rounded-card border border-border bg-border shadow-card sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
      {facts.map(({ term, icon: FactIcon, value, notes }) => (
        <div key={term} className="relative min-w-0 bg-surface py-5 pr-6 pl-15">
          <dt className="font-mono text-xs leading-[1.6] font-medium text-muted">
            <FactIcon aria-hidden="true" className="absolute top-[22px] left-6 size-5 text-accent" />
            {term}
          </dt>
          <dd className="mt-1 text-[15px] leading-[1.45] font-medium text-foreground">
            {value}
            {notes?.map((note) => (
              <span key={note} className="block text-sm leading-[1.45] font-normal text-muted">
                {note}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="top-title"
      className="relative isolate overflow-hidden pt-12 pb-14 sm:pt-18 sm:pb-16 lg:pt-24 lg:pb-20"
    >
      {/* Faint green glow behind the network, upper right. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[20%] -right-[10%] -z-2 h-[90%] w-[70%] bg-[radial-gradient(closest-side,rgb(34_197_94/0.07),transparent)]"
      />
      <HeroNetwork />

      <div className={pageContainer}>
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="min-w-0 max-w-[780px]">
            <RoleLine />

            <h1
              id="top-title"
              className="mt-6 text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.08] tracking-[-0.035em] break-words"
            >
              <Headline text={profile.headline} emphasis={profile.headlineEmphasis} />
            </h1>

            <p className="mt-6 max-w-[46ch] text-lg leading-normal text-foreground sm:text-xl">{profile.subhead}</p>
            <p className="mt-4 max-w-[60ch] text-base leading-[1.6] text-muted">{profile.summary}</p>

            <div className={cx(ctaRow, "mt-8")}>
              <AskAssistantButton size="lg">
                <Sparkle aria-hidden="true" className="size-4.5 shrink-0" />
                Ask my AI anything
              </AskAssistantButton>
              <ButtonLink
                href={profile.links.upwork}
                external
                variant="secondary"
                size="lg"
              >
                Hire me on Upwork
                <ArrowUpRight aria-hidden="true" className="size-4.5 shrink-0" />
              </ButtonLink>
            </div>
          </div>

          <AtAGlance />
        </div>

        <FactList />
      </div>
    </section>
  );
}
