/**
 * Global API Config - Single source for Base URL
 * frontend/src/config/apiConfig.ts
 *
 * Change the Server URL here to update the entire application.
 * No need to update URLs in multiple files.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_KEY =
  import.meta.env.VITE_API_KEY || "form_helper_secret_key_2026";

/** Full URL for API routes - e.g. http://localhost:5000/api/forms */
export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const apiHeaders = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};
