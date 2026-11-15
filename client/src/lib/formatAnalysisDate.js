// "15 Nov 2026, 2:30 pm" in the viewer's own locale and time zone.
export function formatAnalysisDate(createdAt) {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
