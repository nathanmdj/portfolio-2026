import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { Briefcase, Check, GraduationCap, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { StatusDot } from "@/components/ui/status-dot";
import { education, fieldNetworkDiagram, roles, type Role } from "@/content/profile";
import { cx } from "@/lib/cx";
import { isFieldRole, type FieldRole } from "@/lib/roles";
import { sectionHeading } from "@/lib/site-sections";

const periodText = "font-mono text-[0.75rem] font-medium";
const orgText = "text-[0.9375rem] text-foreground-soft";

function CardLabel({ icon: LabelIcon, children }: { icon: Icon; children: ReactNode }) {
  return (
    <p className="mb-6 flex items-center gap-2 font-mono text-[0.75rem] font-medium text-muted">
      <LabelIcon aria-hidden="true" className="size-4 shrink-0 text-accent" />
      {children}
    </p>
  );
}

function RoleTimeline({ items }: { items: Role[] }) {
  return (
    <ol>
      {items.map((role) => (
        <li key={`${role.org}-${role.title}`} className="group relative pb-8 pl-7 last:pb-0">
          <span
            aria-hidden="true"
            className={cx(
              "absolute top-2 left-1 size-[9px] rounded-full border-2",
              role.current
                ? "border-accent bg-accent shadow-[0_0_0_4px_rgb(34_197_94/0.15)]"
                : "border-border-strong bg-surface",
            )}
          />
          <span aria-hidden="true" className="absolute top-6 bottom-1 left-2 w-px bg-border group-last:hidden" />
          <span className={cx(periodText, role.current ? "text-accent" : "text-muted")}>{role.period}</span>
          <h3 className="mt-2 text-[1.0625rem] break-words">{role.title}</h3>
          <p className={cx("mt-0.5", orgText)}>{role.org}</p>
          <p className="mt-2 text-[0.875rem] text-muted">{role.summary}</p>
        </li>
      ))}
    </ol>
  );
}

const schematicBox = "fill-[#131C2E] stroke-border-strong";
const schematicText = "font-mono [text-anchor:middle] [dominant-baseline:central]";
const schematicLabel = cx(schematicText, "text-[13px] fill-foreground-soft");
const schematicCoreLabel = cx(schematicText, "text-[13px] font-semibold fill-foreground");
const schematicSmall = cx(schematicText, "text-[10.5px] fill-muted");
const schematicLine = "fill-none [stroke-width:1.5]";
const schematicLink = cx(schematicLine, "stroke-border-strong");
const schematicFlow = cx(
  schematicLine,
  "stroke-accent [stroke-opacity:0.75] [stroke-dasharray:3_7] motion-safe:animate-schematic-flow",
);

/** Where each uplink sits in the drawing, in the order the profile lists them. */
const uplinkGeometry = [
  { boxY: 44, roleY: 58, path: "M101 66 C 140 66, 135 112, 170 112", dashed: false },
  { boxY: 160, roleY: 194, path: "M101 182 C 140 182, 135 136, 170 136", dashed: true },
] as const;

/** Where each site sits in the drawing, in the order the profile lists them. */
const siteGeometry = [
  { boxY: 12, path: "M310 124 C 380 124, 380 34, 440 34" },
  { boxY: 102, path: "M310 124 L 440 124" },
  { boxY: 192, path: "M310 124 C 380 124, 380 214, 440 214" },
] as const;

/** Decorative drawing of the field network; the caption carries its meaning. */
function NetworkSchematic() {
  const { uplinks, core, backhaul, sites, caption } = fieldNetworkDiagram;

  return (
    <figure className="mb-7 hidden rounded-xl border border-border bg-background-inset p-6 min-[561px]:block">
      <svg viewBox="0 0 560 248" aria-hidden="true" focusable="false" className="block h-auto w-full">
        {uplinkGeometry.map(({ boxY, roleY, path, dashed }, position) => (
          <g key={uplinks[position].label}>
            <path className={cx(schematicLink, dashed && "[stroke-dasharray:4_4]")} d={path} />
            <text className={schematicSmall} x="135" y={roleY}>
              {uplinks[position].role}
            </text>
            <rect className={schematicBox} x="1" y={boxY} width="100" height="44" rx="8" />
            <text className={schematicLabel} x="51" y={boxY + 22}>
              {uplinks[position].label}
            </text>
          </g>
        ))}
        {siteGeometry.map(({ path }) => (
          <path key={path} className={schematicFlow} d={path} />
        ))}
        <text className={schematicSmall} x="240" y="174">
          {backhaul}
        </text>
        <rect className="fill-accent/8 stroke-accent" x="170" y="94" width="140" height="60" rx="10" />
        <text className={schematicCoreLabel} x="240" y="115">
          {core.label}
        </text>
        <text className={schematicSmall} x="240" y="135">
          {core.detail}
        </text>
        {siteGeometry.map(({ boxY, path }, position) => (
          <g key={path}>
            <rect className={schematicBox} x="440" y={boxY} width="119" height="44" rx="8" />
            <text className={schematicLabel} x="499.5" y={boxY + 15}>
              {sites[position].label}
            </text>
            <text className={schematicSmall} x="499.5" y={boxY + 31}>
              {sites[position].detail}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-4 font-mono text-[0.75rem] text-muted">{caption}</figcaption>
    </figure>
  );
}

function FieldRoleCard({ role }: { role: FieldRole }) {
  return (
    <Reveal delay={70}>
      {/* The glow sits in the top-right corner rather than the deep card's top wash. */}
      <Card
        as="article"
        deep
        aria-labelledby="field-role-title"
        className="bg-[radial-gradient(120%_80%_at_100%_0%,rgb(34_197_94/0.08),transparent_55%)]! sm:p-8"
      >
        <NetworkSchematic />

        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">
            {role.current && <StatusDot />}
            {role.period}
          </Badge>
          <Badge>
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="sr-only">Site: </span>
            {role.site}
          </Badge>
        </div>

        <h3
          id="field-role-title"
          className="mt-5 text-[1.3125rem] leading-[1.25] break-words sm:text-[1.5rem]"
        >
          {role.title}
        </h3>
        <p className={cx("mt-1", orgText)}>{role.org}</p>
        <p className="mt-4 text-[1rem] text-foreground-soft">{role.summary}</p>

        {role.points.length > 0 && (
          <ul className="mt-6 grid gap-3">
            {role.points.map((point) => (
              <li
                key={point}
                className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 text-[0.9375rem] leading-[1.55] text-foreground-soft"
              >
                <Check aria-hidden="true" className="mt-[3px] size-[18px] text-accent" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Reveal>
  );
}

export function Experience() {
  const fieldRole = roles.find(isFieldRole);
  const timelineRoles = roles.filter((role) => role !== fieldRole);

  return (
    <Section
      {...sectionHeading("experience")}
      title="Shipping software by day, running a real network in the field."
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Below the two-column layout the roles and education drop under the field card. */}
        <div className="order-2 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:order-none lg:grid-cols-1">
          <Reveal>
            <Card className="h-full">
              <CardLabel icon={Briefcase}>Engineering roles</CardLabel>
              <RoleTimeline items={timelineRoles} />
            </Card>
          </Reveal>
          <Reveal delay={70}>
            <Card className="h-full">
              <CardLabel icon={GraduationCap}>Education</CardLabel>
              <span className={cx(periodText, "text-muted")}>{education.period}</span>
              <h3 className="mt-2 text-[1.0625rem] break-words">{education.degree}</h3>
              <p className={cx("mt-0.5", orgText)}>{education.school}</p>
            </Card>
          </Reveal>
        </div>

        {fieldRole && <FieldRoleCard role={fieldRole} />}
      </div>
    </Section>
  );
}
