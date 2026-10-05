const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Deterministic date formatter (e.g. "18 June 2026").
 * Avoids locale/timezone-based hydration mismatches by parsing the ISO parts
 * directly rather than relying on the runtime locale.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Short form (e.g. "Jun 2026"). */
export function formatMonthYear(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  if (!year || !month) return iso;
  return `${MONTHS[month - 1].slice(0, 3)} ${year}`;
}
