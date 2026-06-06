import { Footer } from "~/components/Footer";
import { Nav } from "~/components/Nav";
import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

const PLAN_FEATURE_MATRIX = [
  [true, true, true, true],
  [true, true, true, true],
  [true, true, true, true],
  [false, true, true, true],
  [false, true, true, true],
  [true, true, true, true],
];

export default function PricingPage() {
  const { t } = useT();
  const pc = t.pricing;
  const websiteFeatures = t.features.items;

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24">
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <SectionTag>{pc.tag}</SectionTag>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {pc.heading}
              </h1>
              <p className="mt-4 text-lg text-slate-400">{pc.intro}</p>
            </Reveal>

            <div className="mt-12 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {pc.plans.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 80}>
                  <article className="card h-full p-6">
                    <p className="text-sm font-medium text-accent-cyan">{plan.name}</p>
                    <p className="mt-3 text-3xl font-bold text-white">{plan.price}</p>
                    <p className="mt-1 text-sm text-slate-500">{plan.cadence}</p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      {plan.description}
                    </p>

                    <div className="mt-6">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-lime">
                        {pc.inLabel}
                      </h2>
                      <ul className="mt-2 space-y-2 text-sm text-slate-300">
                        {plan.included.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckMark className="mt-0.5 h-4 w-4 text-accent-lime" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-rose-300">
                        {pc.outLabel}
                      </h2>
                      <ul className="mt-2 space-y-2 text-sm text-slate-400">
                        {plan.excluded.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CrossMark className="mt-0.5 h-4 w-4 text-rose-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionTag>{pc.tag}</SectionTag>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {pc.matrixHeading}
              </h2>
              <p className="mt-4 text-slate-400">{pc.matrixIntro}</p>
            </Reveal>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr className="bg-white/[0.03] text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {pc.featureColumn}
                    </th>
                    {pc.columns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {websiteFeatures.map((feature, featureIndex) => (
                    <tr key={feature.title}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-white">{feature.title}</p>
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
                          {feature.body}
                        </p>
                      </td>
                      {pc.columns.map((column, columnIndex) => {
                        const included = PLAN_FEATURE_MATRIX[featureIndex][columnIndex];
                        return (
                          <td key={`${feature.title}-${column}`} className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                included
                                  ? "border-accent-lime/40 bg-accent-lime/10 text-accent-lime"
                                  : "border-rose-300/40 bg-rose-300/10 text-rose-300"
                              }`}
                            >
                              {included ? (
                                <CheckMark className="h-3.5 w-3.5" />
                              ) : (
                                <CrossMark className="h-3.5 w-3.5" />
                              )}
                              {included ? pc.inLabel : pc.outLabel}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CheckMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden>
      <path
        d="m4 10 4 4 8-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden>
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
