import type { Icon } from "@phosphor-icons/react";
import { CalendarBlank, CheckCircle, Code, Flag, Globe } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { workingStyle } from "@/content/profile";
import { sectionHeading } from "@/lib/site-sections";

/* Keyed by working-style title in profile.ts; a renamed or new item falls
   back to a generic check rather than losing its icon slot. */
const workingStyleIcons: Record<string, Icon> = {
  "Clean, documented code": Code,
  "Daily updates": CalendarBlank,
  "Spec to deployment": Flag,
  "Async-friendly": Globe,
};

export function Approach() {
  return (
    <Section {...sectionHeading("approach")} band title="How working with me feels.">
      <ol className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {workingStyle.map((principle, index) => {
          const PrincipleIcon = workingStyleIcons[principle.title] ?? CheckCircle;
          return (
            <Reveal
              as="li"
              key={principle.title}
              delay={index * 70}
              className="relative min-w-0 border-t border-border pt-6"
            >
              <span aria-hidden="true" className="absolute -top-px left-0 h-px w-10 bg-accent" />
              <PrincipleIcon aria-hidden="true" className="size-5 text-accent" />
              <h3 className="mt-4 text-[1.0625rem] break-words">{principle.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-muted">{principle.body}</p>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}
