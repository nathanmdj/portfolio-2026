import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { AskAssistantButton } from "@/components/assistant/assistant-context";
import { ProjectThumbnail } from "@/components/project-thumbnail";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { LayerId, Project } from "@/content/profile";
import { cx } from "@/lib/cx";
import { isPastFloor, layersByDepth, layersReachedBy } from "@/lib/stack-layers";

/* Reached layers past the usual web floor (Linux, Network) are lit green;
   the rest of the reached layers are grey. */
function DepthStrip({ layers }: { layers: readonly LayerId[] }) {
  const reached = layersReachedBy(layers);

  return (
    <span
      role="img"
      aria-label={`Layers: ${reached.map((layer) => layer.label).join(", ")}`}
      className="inline-flex shrink-0 gap-[3px]"
    >
      {layersByDepth.map((layer) => (
        <i
          key={layer.id}
          className={cx(
            "h-1 w-3 rounded-[2px]",
            !layers.includes(layer.id) ? "bg-surface-raised" : isPastFloor(layer) ? "bg-accent" : "bg-muted",
          )}
        />
      ))}
    </span>
  );
}

function ProjectBullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-2 text-sm leading-normal text-muted">
      {items.map((item, index) => (
        <li
          key={index}
          className="relative pl-5 before:absolute before:top-[0.72em] before:left-0.5 before:h-px before:w-2 before:bg-accent"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const titleId = `project-${project.slug}-title`;
  const reachesPastFloor = layersReachedBy(project.layers).some(isPastFloor);

  return (
    <Card
      as="article"
      id={`project-${project.slug}`}
      aria-labelledby={titleId}
      interactive
      deep={reachesPastFloor}
      className="group/card flex h-full scroll-mt-24 flex-col gap-4"
    >
      <ProjectThumbnail project={project} />

      <div className="flex items-center justify-between gap-3">
        <span
          className={cx(
            "font-mono text-xs font-medium",
            project.kind === "Own product" ? "text-accent" : "text-muted",
          )}
        >
          {project.kind}
        </span>
        <DepthStrip layers={project.layers} />
      </div>

      <h3 id={titleId} className="text-lg leading-[1.35] break-words">
        {project.title}
      </h3>
      <p className="text-[0.9375rem] leading-[1.55] text-foreground-soft">{project.tagline}</p>

      {project.details.length > 0 && <ProjectBullets items={project.details} />}

      <div className="mt-auto grid gap-4 pt-2">
        <ul aria-label="Stack" className="flex flex-wrap gap-2">
          {project.stack.map((tool) => (
            <Tag as="li" key={tool}>
              {tool}
            </Tag>
          ))}
        </ul>
        {/* A full-width text link under a hairline rule; the important
            modifiers replace the ghost button's centred, padded, rounded box. */}
        <AskAssistantButton
          variant="ghost"
          className="group w-full justify-between! rounded-none! [border-width:1px_0_0]! border-t-border-soft! [padding:0.75rem_0_0]! text-left hover:no-underline! active:translate-y-0!"
          question={`Tell me more about the "${project.title}" project.`}
          aria-label={`Ask about this project: ${project.title}`}
        >
          Ask about this project
          <ArrowRight
            aria-hidden="true"
            className="size-[18px] shrink-0 transition-transform duration-200 ease-settle group-hover:translate-x-[3px]"
          />
        </AskAssistantButton>
      </div>
    </Card>
  );
}
