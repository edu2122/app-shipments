import type { APIRoute } from "astro";
import { createClient } from "../../lib/supabase/server";

export const GET: APIRoute = async ({ request, cookies, redirect, url }) => {
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = createClient(request, cookies);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect("/");
};
