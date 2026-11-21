import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { pageContainer, sectionBand, sectionPadding } from "./page-layout";
import { Reveal } from "./reveal";

export type SectionEyebrowProps = {
  /** Two-digit section number, read out before the name; omit for unnumbered sections. */
  index?: string;
  children: ReactNode;
};

/** The green mono caption above a section title. */
export function SectionEyebrow({ index, children }: SectionEyebrowProps) {
  return (
    <p className="eyebrow">
      {index && <span className="sr-only">Section {index}: </span>}
      {children}
    </p>
  );
}

export type SectionHeaderProps = {
  headingId: string;
  index?: string;
  label: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
};

/** Eyebrow, title and optional intro, as they open every section. */
export function SectionHeader({ headingId, index, label, title, intro, className }: SectionHeaderProps) {
  return (
    <Reveal as="header" className={cx("grid max-w-[720px] gap-4", className)}>
      <SectionEyebrow index={index}>{label}</SectionEyebrow>
      <h2 id={headingId} className="text-[clamp(1.75rem,3.1vw,2.5rem)] leading-[1.15] break-words">
        {title}
      </h2>
      {intro && <div className="max-w-[62ch] text-[1.0625rem] leading-[1.6] text-muted sm:text-lg">{intro}</div>}
    </Reveal>
  );
}

export type SectionProps = {
  /** Anchor id; also used to derive the heading id for aria-labelledby. */
  id: string;
  /** Two-digit section number, e.g. "01". */
  index: string;
  /** Short name shown in the eyebrow, e.g. "Selected work". */
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  /** Sets the section on the slightly raised band background. */
  band?: boolean;
  className?: string;
};

export function Section({ id, index, label, title, intro, children, band = false, className }: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className={cx(band && sectionBand, className)}>
      <div className={cx(pageContainer, sectionPadding.block)}>
        <SectionHeader headingId={headingId} index={index} label={label} title={title} intro={intro} />
        {children && <div className="mt-8 sm:mt-12">{children}</div>}
      </div>
    </section>
  );
}
