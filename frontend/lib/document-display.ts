export function documentDate(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
export function certificatePeriod(
  document: { validFrom?: string; expiresAt?: string },
  today = new Date().toISOString().slice(0, 10),
) {
  if (document.expiresAt && document.expiresAt.slice(0, 10) < today)
    return "Validity date passed";
  if (document.validFrom && document.validFrom.slice(0, 10) > today)
    return "Validity starts in the future";
  return document.validFrom || document.expiresAt
    ? "Stated validity period"
    : "Validity not stated";
}
export function documentSize(bytes?: number) {
  if (!bytes) return "";
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
