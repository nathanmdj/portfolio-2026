import Image from "next/image";
import type { Project } from "@/content/profile";
import { projectThumbnails } from "@/content/project-thumbnails";

/* Matches the card grid: full width on phones, half from 641px, a third
   of the 1200px column from 1024px. */
const sizes = "(min-width: 1024px) 384px, (min-width: 641px) 50vw, 100vw";

/**
 * The image strip across the top of a project card. It bleeds over the card's
 * padding, so it must be the card's first child. Projects without a screenshot
 * get a quiet placeholder of the same shape so every card in a row lines up.
 */
export function ProjectThumbnail({ project }: { project: Pick<Project, "slug" | "title"> }) {
  const image = projectThumbnails[project.slug];

  return (
    <div className="relative -mx-6 -mt-6 mb-2 aspect-[16/10] overflow-hidden rounded-t-[calc(var(--radius-card)-1px)] border-b border-border-soft bg-background-inset">
      {image ? (
        <Image
          src={image}
          alt={`Screenshot of ${project.title}`}
          fill
          sizes={sizes}
          placeholder="blur"
          className="object-cover object-top transition-transform duration-500 ease-settle group-hover/card:scale-[1.03] motion-reduce:group-hover/card:scale-100"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
        >
          <span className="rounded-md border border-border-soft bg-background-inset px-3 py-1.5 font-mono text-xs text-muted">
            ~/{project.slug}
          </span>
        </div>
      )}
    </div>
  );
}
