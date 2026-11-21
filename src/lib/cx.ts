export type ClassValue = string | false | null | undefined;

/** Joins the truthy class names with single spaces. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
