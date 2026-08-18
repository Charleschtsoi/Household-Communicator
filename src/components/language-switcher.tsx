import { setLocaleAction } from "@/lib/actions";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function LanguageSwitcher({
  locale,
  next,
  compact = false,
}: {
  locale: Locale;
  next?: string;
  compact?: boolean;
}) {
  const d = t(locale);
  const options: { value: Locale; label: string }[] = [
    { value: "en", label: d.langEnglish },
    { value: "zh-Hant", label: d.langZhHant },
  ];

  return (
    <div className={`flex gap-2 ${compact ? "" : "mb-5"}`} role="group" aria-label={d.language}>
      {options.map((opt) => {
        const active = locale === opt.value;
        return (
          <form key={opt.value} action={setLocaleAction}>
            <input type="hidden" name="locale" value={opt.value} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <button
              type="submit"
              aria-pressed={active}
              className={`rounded-full border px-3 ${
                compact ? "py-1 text-xs font-bold" : "py-1.5 text-xs"
              } ${
                active
                  ? "border-accent bg-accent-soft font-bold text-accent"
                  : "border-line bg-white font-medium text-ink"
              }`}
            >
              {opt.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}
