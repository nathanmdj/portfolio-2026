import { ProjectCard } from "@/components/project-card";
import { cardGrid } from "@/components/ui/page-layout";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { projects } from "@/content/profile";
import { sectionHeading } from "@/lib/site-sections";
import { layersByDepth } from "@/lib/stack-layers";

const shallowest = layersByDepth[0];
const deepest = layersByDepth[layersByDepth.length - 1];

export function WorkSection() {
  return (
    <Section
      {...sectionHeading("work")}
      title="Products in production, from trading engines to field hardware."
      intro={`Client and product work across fintech, SaaS and embedded Linux. The strip on each card shows which layers it touches, from ${shallowest?.label} to ${deepest?.label}.`}
    >
      <ul className={cardGrid}>
        {projects.map((project, index) => (
          <Reveal as="li" key={project.slug} delay={(index % 3) * 70} className="min-w-0">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
