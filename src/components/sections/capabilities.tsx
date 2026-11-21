import type { Icon } from "@phosphor-icons/react";
import {
  ChartLine,
  Cloud,
  Database,
  HardDrives,
  Monitor,
  Network,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { cardGrid } from "@/components/ui/page-layout";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { capabilities, skills } from "@/content/profile";
import { sectionHeading } from "@/lib/site-sections";
import { layersReachedBy } from "@/lib/stack-layers";

/* Keyed by capability title in profile.ts; a renamed or new capability falls
   back to the generic tile icon rather than breaking the grid. */
const capabilityIcons: Record<string, Icon> = {
  "Backend APIs": HardDrives,
  "Serverless & cloud": Cloud,
  "Postgres / Supabase": Database,
  "Full-stack web & mobile": Monitor,
  "Fintech & data": ChartLine,
  "Linux & networking": Network,
};

export function CapabilitiesSection() {
  return (
    <Section
      {...sectionHeading("capabilities")}
      band
      title="What I can own on your team."
      intro="The areas I work in day to day, mapped to the layers they sit on."
    >
      <ol className={cardGrid}>
        {capabilities.map((capability, index) => {
          const CapabilityIcon = capabilityIcons[capability.title] ?? SquaresFour;
          return (
            <Reveal as="li" key={capability.title} delay={(index % 3) * 70} className="min-w-0">
              <Card as="article" interactive className="h-full">
                <span className="grid size-11 place-items-center rounded-control border border-border bg-surface-raised text-accent">
                  <CapabilityIcon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-5 text-[1.0625rem] break-words">{capability.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted">{capability.body}</p>
                <ul aria-label="Layers" className="mt-5 flex flex-wrap gap-2">
                  {layersReachedBy(capability.layers).map((layer) => (
                    <Tag as="li" key={layer.id} tone="muted">
                      {layer.label}
                    </Tag>
                  ))}
                </ul>
              </Card>
            </Reveal>
          );
        })}
      </ol>

      <Reveal className="mt-12">
        <h3 className="font-mono text-xs font-medium text-muted">
          Skills index <span aria-hidden="true">·</span>{" "}
          <span className="tabular-nums">{skills.length} entries</span>
        </h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Tag as="li" key={skill} tone="muted">
              {skill}
            </Tag>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
