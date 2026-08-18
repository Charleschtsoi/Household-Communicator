import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { joinHouseholdAction } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; bootstrap?: string }>;
}) {
  const session = await getSession();
  if (session) {
    const { getMember } = await import("@/lib/store");
    const member = await getMember(session.memberId);
    if (member) redirect("/today");
    // Orphan session: stay on join rather than looping through /today
  }
  const locale = ((await cookies()).get("hc_locale")?.value as Locale) || "en";
  const d = t(locale);
  const params = await searchParams;
  const error =
    params.error === "HOUSEHOLD_FULL"
      ? d.householdFull
      : params.error === "INVITE_NOT_FOUND"
        ? d.inviteNotFound
        : params.error
          ? params.error
          : null;

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.joinHousehold}
      </h1>
      <form action={joinHouseholdAction} className="mt-6 grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        {params.bootstrap ? (
          <input type="hidden" name="bootstrap" value={params.bootstrap} />
        ) : null}
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.inviteCode}
          <input
            name="inviteCode"
            required
            defaultValue={params.code || ""}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium uppercase tracking-[0.2em] text-ink"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.yourName}
          <input
            name="displayName"
            required
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink"
          />
        </label>
        {error ? <p className="text-sm font-semibold text-urgent">{error}</p> : null}
        <button
          type="submit"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.join}
        </button>
        <Link href="/" className="text-center text-sm font-bold text-accent">
          {d.back}
        </Link>
      </form>
    </main>
  );
}
