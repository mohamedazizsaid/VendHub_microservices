export type AdminDateRange = "all" | "7d" | "30d" | "90d";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const ADMIN_DATE_RANGE_OPTIONS: Array<{ value: AdminDateRange; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export const isDateInRange = (value: string | number | Date | null | undefined, range: AdminDateRange): boolean => {
  if (range === "all") return true;

  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = Date.now();
  const diffMs = now - date.getTime();

  const thresholdDays = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return diffMs <= thresholdDays * DAY_IN_MS;
};
