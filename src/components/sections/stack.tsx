import { stackFloorCopy, typicalStackFloor } from "@/content/profile";
import { StackDepth } from "@/components/stack-depth";
import { pageContainer, sectionBand, sectionPadding } from "@/components/ui/page-layout";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section";
import { cx } from "@/lib/cx";
import { spelledCount } from "@/lib/format";
import { isPastFloor, layersByDepth } from "@/lib/stack-layers";

const SECTION_ID = "stack";
const HEADING_ID = `${SECTION_ID}-title`;
/** The stats and the figure enter a beat after the heading. */
const STAGGER_MS = 70;

const floorLayer = layersByDepth.find((layer) => layer.id === typicalStackFloor);
const belowFloor = layersByDepth.filter(isPastFloor);
const belowFloorList = new Intl.ListFormat("en", { type: "conjunction" }).format(
  belowFloor.map((layer) => layer.label),
);

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p
        className={cx(
          "font-mono text-[32px] leading-none font-semibold tracking-[-0.03em]",
          accent ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}

/** The stack band: how far down the stack the work goes, beside the interactive layer figure. */
export function StackSection() {
  return (
    <section id={SECTION_ID} aria-labelledby={HEADING_ID} className={sectionBand}>
      <div
        className={cx(
          pageContainer,
          sectionPadding.block,
          "grid items-start gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16",
        )}
      >
        {/* Header height (64px) plus breathing room, so the intro rests below the sticky nav. */}
        <div className="lg:sticky lg:top-24">
          <SectionHeader
            headingId={HEADING_ID}
            label="Stack depth"
            title="From the interface down to the wire."
            className="mb-8 sm:mb-10"
            intro={
              <p>
                {floorLayer && <>Most web developers stop at the {floorLayer.label.toLowerCase()}. </>}
                {belowFloor.length > 0 && (
                  <>
                    I go {spelledCount(belowFloor.length)} {belowFloor.length === 1 ? "layer" : "layers"} deeper
                    &mdash; into {belowFloorList}, {stackFloorCopy.beyond}.
                  </>
                )}
              </p>
            }
          />
          <Reveal delay={STAGGER_MS} className="grid max-w-[480px] grid-cols-2 gap-4 lg:max-w-none">
            <Stat value={String(layersByDepth.length)} label="layers I work across" />
            {belowFloor.length > 0 && (
              <Stat value={`+${belowFloor.length}`} label="below where most stop" accent />
            )}
          </Reveal>
        </div>

        <Reveal delay={STAGGER_MS}>
          <StackDepth />
        </Reveal>
      </div>
    </section>
  );
}
