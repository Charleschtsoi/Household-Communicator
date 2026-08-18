import { cookies } from "next/headers";

export const SESSION_COOKIE = "hc_session";

export type Session = {
  householdId: string;
  memberId: string;
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Session;
    if (!parsed.householdId || !parsed.memberId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
