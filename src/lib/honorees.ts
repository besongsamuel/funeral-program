import type { Honoree } from './types';

export function sortedHonorees(honorees: Honoree[]) {
  return [...honorees].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Tributes saved before a person was chosen belong with the first honoree. */
export function primaryHonoree(honorees: Honoree[]) {
  return sortedHonorees(honorees)[0];
}

export function matchesHonoree(itemHonoreeId: string | undefined | null, honoree: Honoree, honorees: Honoree[]) {
  const assigned = itemHonoreeId || primaryHonoree(honorees)?.id;
  return assigned === honoree.id;
}

export function honoreeById(honorees: Honoree[], honoreeId?: string | null) {
  if (honoreeId) return honorees.find((honoree) => honoree.id === honoreeId);
  return primaryHonoree(honorees);
}

export function honoreeName(honorees: Honoree[], honoreeId?: string | null) {
  return honoreeById(honorees, honoreeId)?.fullName ?? '';
}
