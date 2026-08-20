import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { SessionRecovery } from "@/components/session-recovery";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember, monthSpendTotals } from "@/lib/store";
import { categoryLabel, t } from "@/lib/i18n";

function formatBoughtDate(iso: string | null, locale: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-HK" : "en-HK", {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export default async function RecordPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  const bundle = member ? await getHouseholdBundle(session.householdId) : null;
  if (!member || !bundle) return <SessionRecovery />;
  const d = t(member.locale);
  const nameById = Object.fromEntries(bundle.members.map((m) => [m.id, m.displayName]));
  const completed = bundle.needs
    .filter((n) => n.status === "bought")
    .sort((a, b) => (b.boughtAt || "").localeCompare(a.boughtAt || ""));
  const { householdTotal } = monthSpendTotals(bundle.needs, bundle.members);

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-12">
      <h1 className="mb-1 font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.record}
      </h1>
      <p className="mb-4 text-sm leading-relaxed text-muted">{d.recordHint}</p>

      <section className="mb-5 rounded-2xl border border-line bg-white p-3">
        <div className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
          {d.thisMonth}
        </div>
        <div className="mt-1 font-[family-name:var(--font-bricolage)] text-2xl font-bold">
          ${Math.round(householdTotal)} HKD
        </div>
        <div className="mt-1 text-xs text-muted">{d.optionalAmounts}</div>
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
          {d.completed}
        </h2>
        {completed.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-[family-name:var(--font-bricolage)] text-lg font-bold">
              {d.noRecordsYet}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{d.noRecordsHint}</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {completed.map((need) => (
              <div key={need.id} className="rounded-2xl border border-line bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {need.name}
                      {need.quantity > 1 ? ` ×${need.quantity}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {categoryLabel(member.locale, need.category)}
                      {need.boughtById ? ` · ${nameById[need.boughtById] || d.whoBought}` : ""}
                      {need.boughtAt
                        ? ` · ${formatBoughtDate(need.boughtAt, member.locale)}`
                        : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-[family-name:var(--font-bricolage)] text-lg font-bold">
                    {need.amount != null ? `$${need.amount}` : (
                      <span className="text-xs font-semibold text-muted">{d.amountNone}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomNav active="record" locale={member.locale} />
    </main>
  );
}
