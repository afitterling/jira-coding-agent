import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

export function Faq() {
  const { t } = useT();
  const f = t.faq;

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 border-b border-white/5 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionTag>{f.tag}</SectionTag>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {f.heading}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            {f.intro}
          </p>
        </Reveal>

        <div className="mt-12 space-y-3">
          {f.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <details className="card group overflow-hidden transition-colors open:border-white/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-semibold text-white">
                    {item.q}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                    fill="none"
                  >
                    <path
                      d="M5 8l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
