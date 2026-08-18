import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { NeedActions } from "@/components/need-actions";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember } from "@/lib/store";
import { cadenceLabel, categoryLabel, t } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/types";

export default async function NeedsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  if (!member) redirect("/");
  const bundle = await getHouseholdBundle(session.householdId);
  if (!bundle) redirect("/");
  const d = t(member.locale);
  const nameById = Object.fromEntries(bundle.members.map((m) => [m.id, m.displayName]));
  const openNeeds = bundle.needs.filter((n) => n.status !== "bought");

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
          {d.needs}
        </h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[0.72rem] font-bold text-accent">
          {d.filtersOpen}
        </span>
        <span className="rounded-md bg-chip px-2 py-0.5 text-[0.72rem] font-bold text-muted">
          {d.filtersClaimed}
        </span>
        <span className="rounded-md bg-chip px-2 py-0.5 text-[0.72rem] font-bold text-muted">
          {d.filtersRecurring}
        </span>
      </div>

      {CATEGORIES.map((cat) => {
        const rows = openNeeds.filter((n) => n.category === cat);
        if (rows.length === 0) return null;
        return (
          <section key={cat} className="mb-4">
            <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
              {categoryLabel(member.locale, cat)}
            </h2>
            <div className="grid gap-2">
              {rows.map((need) => (
                <div key={need.id} className="rounded-2xl border border-line bg-white p-3">
                  <div className="font-semibold">
                    {need.name}
                    {need.quantity > 1 ? ` ×${need.quantity}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {need.claimedById
                      ? `${d.claimed} · ${nameById[need.claimedById]}`
                      : `${d.open} · qty ${need.quantity}`}
                    {need.recurringCadence
                      ? ` · ${cadenceLabel(member.locale, need.recurringCadence)}`
                      : ""}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {need.urgent ? (
                      <span className="rounded-md bg-urgent-soft px-2 py-0.5 text-[0.72rem] font-bold text-urgent">
                        Urgent
                      </span>
                    ) : null}
                    <NeedActions
                      needId={need.id}
                      claimed={!!need.claimedById}
                      members={bundle.members.map((m) => ({
                        id: m.id,
                        name: m.displayName,
                      }))}
                      labels={{
                        claim: d.claim,
                        reassign: d.reassign,
                        bought: d.bought,
                        clearClaim: d.clearClaim,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Link
        href="/needs/new"
        className="sticky bottom-16 mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
      >
        + {d.addNeed}
      </Link>

      <BottomNav active="needs" locale={member.locale} />
    </main>
  );
}
