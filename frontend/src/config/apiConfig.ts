/**
 * Global API Config - Single source for Base URL
 * client/src/config/apiConfig.ts
 *
 * Server URL yahin se change karein - poora app ek jagah update ho jayega.
 * No need to change URLs in 50 files.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Full URL for API routes - e.g. http://localhost:5000/api/forms */
export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
