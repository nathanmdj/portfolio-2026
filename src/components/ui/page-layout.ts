/** Centred page column: 1200px of content inside a 32px gutter (16px on phones). */
export const pageContainer = "mx-auto w-full max-w-[1264px] px-4 sm:px-8";

/** Vertical rhythm between sections: 72px on phones, 88px on tablets, 112px on desktop. */
export const sectionPadding = {
  block: "py-18 sm:py-22 lg:py-28",
  bottom: "pb-18 sm:pb-22 lg:pb-28",
} as const;

/** The slightly raised background that alternate sections sit on. */
export const sectionBand = "border-y border-border-soft bg-background-raised";

/** Card grid: one column on phones, two from 641px, three from 1024px. */
export const cardGrid = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3";

/** Row of calls to action; each button takes the full width on phones. */
export const ctaRow = "flex flex-wrap gap-3 max-sm:*:flex-[1_1_100%]";
