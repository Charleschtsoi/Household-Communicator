import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHouseholdAction } from "@/lib/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getSession } from "@/lib/session";
import { parseLocale, t } from "@/lib/i18n";

export default async function CreatePage() {
  if (await getSession()) redirect("/today");
  const locale = parseLocale((await cookies()).get("hc_locale")?.value);
  const d = t(locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <LanguageSwitcher locale={locale} next="/create" />
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.createHousehold}
      </h1>
      <form action={createHouseholdAction} className="mt-6 grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.householdName}
          <input
            name="householdName"
            required
            defaultValue="Flat 12B"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink"
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
        <button
          type="submit"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.create}
        </button>
        <Link href="/" className="text-center text-sm font-bold text-accent">
          {d.back}
        </Link>
      </form>
    </main>
  );
}
