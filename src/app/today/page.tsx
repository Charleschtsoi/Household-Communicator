import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { SessionRecovery } from "@/components/session-recovery";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember } from "@/lib/store";
import { cadenceLabel, categoryLabel, presenceLabel, t } from "@/lib/i18n";

export default async function TodayPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  const bundle = member ? await getHouseholdBundle(session.householdId) : null;
  if (!member || !bundle) return <SessionRecovery />;
  const d = t(member.locale);

  // Shopping board only — bought items belong on Record, not here.
  const openNeeds = bundle.needs.filter((n) => n.status !== "bought");
  const urgent = openNeeds.filter((n) => n.urgent);
  const presenceRows = bundle.presence.filter((p) => p.status !== "home");
  const empty = openNeeds.length === 0;

  const nameById = Object.fromEntries(bundle.members.map((m) => [m.id, m.displayName]));

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
          {d.today}
        </h1>
        <Link href="/presence" className="text-sm font-bold text-accent">
          {d.updateMine}
        </Link>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-bold">{d.nothingYet}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{d.nothingHint}</p>
          <Link
            href="/needs/new"
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
          >
            {d.addNeed}
          </Link>
        </div>
      ) : (
        <>
          {urgent.length > 0 ? (
            <section className="mb-4">
              <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
                {d.urgentSection}
              </h2>
              <div className="grid gap-2">
                {urgent.map((need) => (
                  <div key={need.id} className="rounded-2xl border border-line bg-white p-3">
                    <div className="font-semibold">{need.name}</div>
                    <div className="mt-1 text-xs text-muted">
                      {categoryLabel(member.locale, need.category)} · {d.qty} {need.quantity} ·{" "}
                      {need.claimedById ? nameById[need.claimedById] : d.unclaimed}
                    </div>
                    <span className="mt-2 inline-flex rounded-md bg-urgent-soft px-2 py-0.5 text-[0.72rem] font-bold text-urgent">
                      {d.urgentChip}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {presenceRows.length > 0 ? (
            <section className="mb-4">
              <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
                {d.presenceSection}
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {presenceRows.map((p) => (
                  <div
                    key={p.memberId}
                    className="min-w-[7.5rem] rounded-xl border border-line bg-white p-2.5"
                  >
                    <div className="text-sm font-bold">{nameById[p.memberId] || "—"}</div>
                    <div className="mt-1 text-[0.75rem] text-muted">
                      {presenceLabel(member.locale, p.status)}
                      {p.placeText ? ` · ${p.placeText}` : ""}
                      {p.backBy ? (
                        <>
                          <br />
                          {d.backBy} {p.backBy}
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mb-4">
            <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
              {d.openNeeds}
            </h2>
            <div className="grid gap-2">
              {openNeeds.slice(0, 6).map((need) => (
                <div key={need.id} className="rounded-2xl border border-line bg-white p-3">
                  <div className="font-semibold">
                    {need.name}
                    {need.quantity > 1 ? ` ×${need.quantity}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {categoryLabel(member.locale, need.category)}
                    {need.claimedById ? ` · ${nameById[need.claimedById]}` : ""}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[0.72rem] font-bold text-accent">
                      {need.claimedById ? d.claimed : d.open}
                    </span>
                    {need.recurringCadence ? (
                      <span className="rounded-md bg-[#f6e6d6] px-2 py-0.5 text-[0.72rem] font-bold text-[#8a5a32]">
                        {cadenceLabel(member.locale, need.recurringCadence)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <BottomNav active="today" locale={member.locale} />
    </main>
  );
}
