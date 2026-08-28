import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | undefined;

// Browser-side client using the public anon key — safe to expose, and only
// ever used to subscribe to chat "go refetch" pings (see
// lib/chat-context.tsx), never to read/write data directly.
export function getSupabaseBrowser() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
