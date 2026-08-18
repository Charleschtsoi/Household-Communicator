import { cookies } from "next/headers";
import { signOutAction } from "@/lib/actions";
import { parseLocale, t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SessionRecovery() {
  const jar = await cookies();
  const locale = parseLocale(jar.get("hc_locale")?.value);
  const d = t(locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <LanguageSwitcher locale={locale} next="/" />
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.sessionResetTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{d.sessionResetBody}</p>
      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.startOver}
        </button>
      </form>
      <a
        href="/api/reset"
        className="mt-3 text-center text-sm font-bold text-accent underline"
      >
        {d.clearCookiesViaReset}
      </a>
    </main>
  );
}
