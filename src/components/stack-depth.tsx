"use client";

import { useState } from "react";
import { ArrowDown, ArrowDownRight, ArrowUp } from "@phosphor-icons/react";
import { profile, projects, stackFloorCopy, type LayerId, type StackLayer } from "@/content/profile";
import { Tag } from "@/components/ui/tag";
import { cx } from "@/lib/cx";
import { sentenceCase, spelledCount } from "@/lib/format";
import { isPastFloor, layersByDepth as layers } from "@/lib/stack-layers";

const DETAIL_ID = "stack-depth-detail";
const DEFAULT_LAYER: LayerId = "network";

/** Background of the panel's header and footer strips. */
const panelStrip = "bg-surface-strip";

/**
 * Row grid: depth, name and meter on one line with the tools wrapping below
 * on narrow screens; one line of four columns from 761px up.
 */
const rowGrid =
  "grid grid-cols-[32px_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 px-4 py-5 min-[761px]:grid-cols-[40px_minmax(0,1fr)_minmax(0,1.3fr)_40px] min-[761px]:items-center min-[761px]:gap-6 min-[761px]:px-6";

function depthCode(layer: StackLayer) {
  return `L${layer.depth}`;
}

function projectsOn(layerId: LayerId) {
  return projects.filter((project) => project.layers.includes(layerId));
}

const aboveFloor = layers.filter((layer) => !isPastFloor(layer));
const belowFloor = layers.filter(isPastFloor);
const legendName = profile.name.split(" ")[0];

function DepthCode({ layer, selected }: { layer: StackLayer; selected: boolean }) {
  const pastFloor = isPastFloor(layer);
  return (
    <span
      className={cx(
        // The negative margin keeps the code where it sits unselected, so picking a row never shifts it.
        "-mx-1.5 inline-flex rounded-md border px-1.5 py-0.5 font-mono text-[13px] leading-[1.4] font-medium transition-colors duration-200",
        !selected && (pastFloor ? "border-transparent text-accent" : "border-transparent text-muted"),
        selected &&
          (pastFloor
            ? "border-accent-line bg-accent-soft text-accent"
            : "border-border bg-surface-raised text-foreground"),
      )}
    >
      {depthCode(layer)}
    </span>
  );
}

/** Two bars per row: the typical web developer's reach, then Jonathan's. */
function Meter({ layer }: { layer: StackLayer }) {
  const bar = "h-7 w-2.5 rounded-[3px] border border-border-strong";
  return (
    <span
      aria-hidden="true"
      className="col-start-3 row-start-1 flex justify-end gap-1.5 min-[761px]:col-start-4"
    >
      <i className={cx(bar, !isPastFloor(layer) && "bg-border-strong")} />
      <i className={cx(bar, "border-accent bg-accent")} />
    </span>
  );
}

function LayerRow({
  layer,
  selected,
  onSelect,
}: {
  layer: StackLayer;
  selected: boolean;
  onSelect: (layer: StackLayer) => void;
}) {
  const pastFloor = isPastFloor(layer);
  return (
    <li
      className={cx(
        rowGrid,
        "relative border-t border-border-soft transition-colors duration-200 first:border-t-0",
        pastFloor
          ? cx(
              "shadow-[inset_2px_0_0_var(--accent)] hover:bg-[rgb(34_197_94/0.04)]",
              selected
                ? "bg-[linear-gradient(90deg,rgb(34_197_94/0.16),rgb(34_197_94/0)_65%)]"
                : "bg-[linear-gradient(90deg,rgb(34_197_94/0.09),rgb(34_197_94/0)_65%)]",
            )
          : selected
            ? "bg-[rgb(148_163_184/0.06)]"
            : "hover:bg-[rgb(148_163_184/0.04)]",
      )}
    >
      {/* The button's overlay covers the whole row, so the tools and meter select it too. */}
      <button
        type="button"
        aria-pressed={selected}
        aria-controls={DETAIL_ID}
        onClick={() => onSelect(layer)}
        className="col-span-2 col-start-1 row-start-1 grid grid-cols-subgrid items-start text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent min-[761px]:items-center"
      >
        <span>
          <DepthCode layer={layer} selected={selected} />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[17px] font-semibold tracking-[-0.02em] text-balance text-foreground">
            {layer.label}
          </span>
          <span className="mt-1 block text-sm leading-normal text-muted">{layer.summary}</span>
        </span>
      </button>
      <ul
        aria-label={`${layer.label} tools`}
        className="col-span-2 col-start-2 row-start-2 flex flex-wrap gap-2 min-[761px]:col-span-1 min-[761px]:col-start-3 min-[761px]:row-start-1"
      >
        {layer.tools.map((tool) => (
          <Tag key={tool} as="li">
            {tool}
          </Tag>
        ))}
      </ul>
      <Meter layer={layer} />
    </li>
  );
}

function FloorNote() {
  return (
    <div
      role="note"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-dashed border-border-strong bg-background-inset px-4 py-3 font-mono text-[13px] text-foreground-soft min-[761px]:px-6"
    >
      <span className="inline-flex items-center gap-2">
        <ArrowUp aria-hidden="true" className="size-4 shrink-0" />
        {sentenceCase(stackFloorCopy.marker)}
      </span>
      {belowFloor.length > 0 && (
        <span className="inline-flex items-center gap-2 text-accent">
          {sentenceCase(spelledCount(belowFloor.length))} {belowFloor.length === 1 ? "layer" : "layers"} deeper
          <ArrowDown aria-hidden="true" className="size-4 shrink-0" />
        </span>
      )}
    </div>
  );
}

function LayerDetail({ layer }: { layer: StackLayer }) {
  const shipped = projectsOn(layer.id);
  return (
    <div id={DETAIL_ID} className={cx(panelStrip, "border-t border-border px-4 py-5 min-[761px]:px-6")}>
      <p className="font-mono text-[13px] text-muted">
        <span className={isPastFloor(layer) ? "text-accent" : "text-foreground-soft"}>{depthCode(layer)}</span>{" "}
        <span className="font-medium text-foreground">{layer.label}</span> · shipped on this layer
      </p>
      {shipped.length > 0 ? (
        <ul
          aria-label={`Projects on the ${layer.label} layer`}
          className="mt-3 grid gap-x-6 min-[761px]:grid-cols-2"
        >
          {shipped.map((project) => (
            <li key={project.slug} className="border-t border-border-soft">
              <a
                href={`#project-${project.slug}`}
                className="group flex min-h-11 items-center justify-between gap-3 py-2 text-sm leading-snug font-medium text-foreground transition-colors duration-200 hover:text-accent"
              >
                <span className="min-w-0">{project.title}</span>
                <ArrowDownRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted transition-colors duration-200 group-hover:text-accent"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">No listed projects on this layer yet.</p>
      )}
    </div>
  );
}

export function StackDepth() {
  const [selectedId, setSelectedId] = useState<LayerId>(DEFAULT_LAYER);
  // Empty until the visitor picks a layer, so nothing is announced on load.
  const [announcement, setAnnouncement] = useState("");
  const selected = layers.find((layer) => layer.id === selectedId) ?? layers[layers.length - 1];

  const select = (layer: StackLayer) => {
    setSelectedId(layer.id);
    setAnnouncement(`${layer.label} layer selected. ${layer.summary}.`);
  };

  const rowsFor = (group: StackLayer[]) =>
    group.map((layer) => (
      <LayerRow key={layer.id} layer={layer} selected={layer.id === selected.id} onSelect={select} />
    ));

  return (
    <figure className="min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <figcaption
        className={cx(
          panelStrip,
          "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border p-4 font-mono text-[13px] text-muted min-[761px]:px-6",
        )}
      >
        <span className="font-medium text-foreground">
          {sentenceCase(spelledCount(layers.length))} layers, closest to the user first
        </span>
        <span aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-2">
            <i className="size-2.5 rounded-[3px] bg-border-strong" />
            Typical web developer
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="size-2.5 rounded-[3px] bg-accent" />
            {legendName}
          </span>
        </span>
      </figcaption>

      <div role="group" aria-label="Stack layers, from the interface down to the network">
        <ol>{rowsFor(aboveFloor)}</ol>
        {belowFloor.length > 0 && (
          <>
            <FloorNote />
            <ol start={aboveFloor.length + 1}>{rowsFor(belowFloor)}</ol>
          </>
        )}
      </div>

      <LayerDetail layer={selected} />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </figure>
  );
}
