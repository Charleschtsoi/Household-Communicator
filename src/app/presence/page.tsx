import Link from "next/link";
import { redirect } from "next/navigation";
import { clearPresenceAction, setPresenceAction } from "@/lib/actions";
import { SessionRecovery } from "@/components/session-recovery";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember } from "@/lib/store";
import { t } from "@/lib/i18n";

export default async function PresencePage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  const bundle = member ? await getHouseholdBundle(session.householdId) : null;
  if (!member || !bundle) return <SessionRecovery />;
  const current = bundle.presence.find((p) => p.memberId === session.memberId);
  const d = t(member.locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.5rem] font-bold tracking-tight">
        {d.sharePresence}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{d.presenceHint}</p>
      <form action={setPresenceAction} className="mt-6 grid gap-4">
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.status}
          <select
            name="status"
            defaultValue={current?.status || "out"}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          >
            <option value="home">{d.home}</option>
            <option value="out">{d.out}</option>
            <option value="home_soon">{d.homeSoon}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.place}
          <input
            name="placeText"
            defaultValue={current?.placeText || ""}
            placeholder="Market / office / gym"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.backBy}
          <input
            name="backBy"
            type="time"
            defaultValue={current?.backBy || ""}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          />
        </label>
        <button
          type="submit"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.save}
        </button>
      </form>
      <form action={clearPresenceAction} className="mt-3">
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold"
        >
          {d.imHome}
        </button>
      </form>
      <Link href="/today" className="mt-4 text-center text-sm font-bold text-accent">
        {d.cancel}
      </Link>
    </main>
  );
}
