import { auth } from "@/lib/auth";

/**
 * Fetches from the backend API with the customer's bearer token attached.
 * Server-side only (reads the session via auth()).
 */
export async function backendFetch(path: string, init?: RequestInit) {
  const session = await auth();
  const headers = new Headers(init?.headers);
  // Only default to JSON when the caller hasn't set their own Content-Type —
  // file uploads pass through multipart/form-data (with its boundary) and
  // must not be overridden here, or the backend can't parse the body.
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.backendToken) {
    headers.set("Authorization", `Bearer ${session.backendToken}`);
  }

  return fetch(`${process.env.BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
