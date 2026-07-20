/**
 * Resolve a cover URL returned by the backend (which starts with "/api/...")
 * into an absolute URL using the configured VITE_API_URL base.
 *
 * Examples:
 *   "/api/uploads/abc123.jpg" → "http://localhost:5000/api/uploads/abc123.jpg"
 *   null / undefined         → null
 */
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export function resolveCoverUrl(coverUrl) {
  if (!coverUrl) return null;
  // If already an absolute URL (e.g. external CDN), return as-is
  if (coverUrl.startsWith("http")) return coverUrl;
  // Otherwise prepend the backend host
  return `${BASE}${coverUrl}`;
}
