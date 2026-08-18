import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMember } from "@/lib/store";
import { parseLocale, t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SessionRecovery } from "@/components/session-recovery";

export default async function WelcomePage() {
  const session = await getSession();
  if (session) {
    const member = await getMember(session.memberId);
    // Only enter the app when household data is actually available.
    // Orphan session cookies must NOT bounce / ↔ /today forever.
    if (member) redirect("/today");
    return <SessionRecovery />;
  }

  const jar = await cookies();
  const locale = parseLocale(jar.get("hc_locale")?.value);
  const d = t(locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <LanguageSwitcher locale={locale} next="/" />

      <h1 className="font-[family-name:var(--font-bricolage)] text-[2.1rem] font-bold leading-tight tracking-tight text-ink">
        {d.brand}
      </h1>
      <p className="mt-3 max-w-[36ch] text-[0.95rem] leading-relaxed text-muted">{d.tagline}</p>

      <div className="mt-10 grid gap-3">
        <Link
          href="/create"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.getStarted}
        </Link>
        <Link
          href="/join"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink"
        >
          {d.joinHousehold}
        </Link>
      </div>
    </main>
  );
}
