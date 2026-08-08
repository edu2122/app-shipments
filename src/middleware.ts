import { defineMiddleware } from "astro:middleware";
import { createClient } from "./lib/supabase/server";

const PUBLIC_PATHS = new Set(["/login", "/auth/callback"]);

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createClient(context.request, context.cookies);
  context.locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  context.locals.user = user;

  const isPublicPath = PUBLIC_PATHS.has(context.url.pathname);

  if (!user && !isPublicPath) {
    return context.redirect("/login");
  }

  if (user && context.url.pathname === "/login") {
    return context.redirect("/");
  }

  return next();
});
