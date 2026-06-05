import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

const CASE_META: { glyph: string; dot: string }[] = [
  { glyph: "</>", dot: "bg-accent" },
  { glyph: "$", dot: "bg-accent-lime" },
  { glyph: "⤳", dot: "bg-accent-violet" },
  { glyph: "▦", dot: "bg-accent-cyan" },
];

export function UseCases() {
  const { t } = useT();
  const u = t.useCases;
  const cases = CASE_META.map((m, i) => ({ ...m, ...u.items[i] }));
  return (
    <section
      id="use-cases"
      className="relative scroll-mt-20 border-b border-white/5 py-24 sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" />
              {u.badge}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {u.titleLead}<span className="text-gradient">{u.titleAccent}</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400">
              {u.intro}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div className="card group h-full p-6 transition-colors hover:border-white/20">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${c.dot} font-mono text-sm font-bold text-ink-950 shadow-glow`}
                >
                  {c.glyph}
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
