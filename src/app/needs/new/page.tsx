import Link from "next/link";
import { redirect } from "next/navigation";
import { addNeedAction } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { getMember } from "@/lib/store";
import { t } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/types";

export default async function NewNeedPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  if (!member) redirect("/");
  const d = t(member.locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.addNeed}
      </h1>
      <form action={addNeedAction} className="mt-6 grid gap-4">
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.item}
          <input
            name="name"
            required
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.quantity}
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.category}
          <select
            name="category"
            defaultValue="groceries"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "groceries"
                  ? d.groceries
                  : c === "household"
                    ? d.householdCat
                    : c === "personal"
                      ? d.personal
                      : d.other}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>{d.urgent}</span>
          <input name="urgent" type="checkbox" className="size-5 accent-[var(--accent)]" />
        </label>
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>{d.recurring}</span>
          <input name="recurring" type="checkbox" className="size-5 accent-[var(--accent)]" />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.cadence}
          <select
            name="cadence"
            defaultValue="weekly"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          >
            <option value="weekly">{d.weekly}</option>
            <option value="biweekly">{d.biweekly}</option>
            <option value="monthly">{d.monthly}</option>
          </select>
        </label>
        <button
          type="submit"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.addToList}
        </button>
        <Link href="/needs" className="text-center text-sm font-bold text-accent">
          {d.cancel}
        </Link>
      </form>
    </main>
  );
}
