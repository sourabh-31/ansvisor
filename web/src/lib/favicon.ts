/**
 * Returns a high-quality favicon URL for a given domain
 * using Google's public favicon service.
 */
export function getFaviconUrl(domain: string, size: number = 128): string {
  const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  if (!clean) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=${size}`;
}
