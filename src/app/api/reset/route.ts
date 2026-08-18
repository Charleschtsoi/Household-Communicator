import { NextResponse } from "next/server";
import { DB_COOKIE } from "@/lib/store";
import { SESSION_COOKIE } from "@/lib/session";

/** Break redirect loops / orphan cookies: visit /api/reset */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/", url.origin));
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(DB_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set("hc_locale", "", { path: "/", maxAge: 0 });
  return res;
}
