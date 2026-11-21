import { twoDigit } from "@/lib/format";

/**
 * The page's numbered sections, in reading order. The header menu and each
 * section's eyebrow both come from this list, so their names and order
 * cannot disagree. The order here must match the render order in app/page.tsx.
 */
export const siteSections = [
  { id: "work", navLabel: "Work", label: "Selected work" },
  { id: "capabilities", navLabel: "Capabilities", label: "Capabilities" },
  { id: "experience", navLabel: "Experience", label: "Experience" },
  { id: "approach", navLabel: "Approach", label: "Approach" },
  { id: "fit", navLabel: "Fit", label: "Check the fit" },
  { id: "contact", navLabel: "Contact", label: "Contact" },
] as const;

export type SiteSectionId = (typeof siteSections)[number]["id"];

/** One entry of the header menu. */
export type SectionNavItem = { href: string; label: string };

export const sectionNavItems: SectionNavItem[] = siteSections.map((section) => ({
  href: `#${section.id}`,
  label: section.navLabel,
}));

/** The id, two-digit index and label a <Section> needs for its heading. */
export function sectionHeading(id: SiteSectionId): { id: SiteSectionId; index: string; label: string } {
  const position = siteSections.findIndex((section) => section.id === id);
  return { id, index: twoDigit(position + 1), label: siteSections[position].label };
}
