import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

// Generic proxy so client components (add to cart, update quantity, place
// order) can mutate data without the customer's bearer token ever reaching
// the browser — same reasoning as the dashboard's identical route. Every
// /api/backend/* call here re-attaches the session's token server-side.
//
// Body is read as raw bytes (not .text()) and the original Content-Type is
// forwarded as-is — needed so multipart/form-data uploads (with their
// boundary) pass through intact instead of getting corrupted by a UTF-8
// text decode and overwritten with "application/json".
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const hasBody = req.method !== "GET" && req.method !== "DELETE";
  const body = hasBody ? await req.arrayBuffer() : undefined;
  const contentType = req.headers.get("content-type");

  const res = await backendFetch(`/api/${path.join("/")}${req.nextUrl.search}`, {
    method: req.method,
    body,
    headers: contentType ? { "Content-Type": contentType } : undefined,
  });

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer.byteLength ? buffer : null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
