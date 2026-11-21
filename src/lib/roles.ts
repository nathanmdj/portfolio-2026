import type { Role } from "@/content/profile";

/** A role carried out at a physical site rather than only on screen. */
export type FieldRole = Role & { site: string };

export function isFieldRole(role: Role): role is FieldRole {
  return Boolean(role.site);
}
