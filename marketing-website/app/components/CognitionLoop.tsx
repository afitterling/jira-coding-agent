import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

/* ---- geometry (SVG units; viewBox 680 x 660) ---- */
const CX = 340;
const CY = 320;
const RING = 170; // radius nodes sit on
const BUBBLE = 40; // node bubble radius
const HUB = 98; // centre hub radius
const BOUND = 296; // dashed boundary radius
const LABEL = 232; // radius for stage labels

const rad = (deg: number) => ((deg - 0) * Math.PI) / 180;
/** angle measured from top (12 o'clock), clockwise positive */
const px = (deg: number, r: number) => CX + r * Math.sin(rad(deg));
const py = (deg: number, r: number) => CY - r * Math.cos(rad(deg));

/** stage display metadata — names/bodies come from i18n, in order */
const STAGE_META = [
  { angle: 0, anchor: "middle" as const, icon: "eye" },
  { angle: 72, anchor: "start" as const, icon: "brain" },
  { angle: 144, anchor: "start" as const, icon: "tree" },
  { angle: 216, anchor: "end" as const, icon: "act" },
  { angle: 288, anchor: "end" as const, icon: "loop" },
];

export function CognitionLoop() {
  const { t } = useT();
  const c = t.cognition;
  const stages = STAGE_META.map((m, i) => ({ ...m, ...c.stages[i] }));
  // the objective the core stays anchored to, on one line
  const objective = c.centerLines
    .map((s) => s.replace(/\s*\/\s*$/, ""))
    .join(" · ");
  // arrowheads sit halfway between nodes, pointing clockwise along the ring
  const arrows = [36, 108, 180, 252, 324];

  return (
    <section
      id="cognition"
      className="relative scroll-mt-20 border-b border-white/5 py-24 sm:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <SectionTag>{c.tag}</SectionTag>
          <h2 className="mt-4 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {c.titleLead}
            <span className="text-gradient">{c.titleAccent}</span>
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-400">
            {c.intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* ---- the loop ---- */}
          <Reveal>
            <figure className="relative mx-auto max-w-[560px]">
              <svg
                viewBox="0 0 680 660"
                className="h-auto w-full"
                role="img"
                aria-label={`${c.titleLead}${c.titleAccent}`}
              >
                <defs>
                  <linearGradient id="cog-flow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <radialGradient id="cog-hub" cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#131326" />
                    <stop offset="100%" stopColor="#06060d" />
                  </radialGradient>
                </defs>

                {/* boundary — the lines it never thinks outside of */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={BOUND}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeOpacity="0.28"
                  strokeWidth="1.5"
                  strokeDasharray="2 9"
                  className="origin-center motion-safe:animate-[spin_60s_linear_infinite]"
                />

                {/* flow track */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={RING}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                  strokeWidth="14"
                />
                {/* animated flow */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={RING}
                  fill="none"
                  stroke="url(#cog-flow)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="14 22"
                  className="origin-center motion-safe:animate-[spin_14s_linear_infinite]"
                />

                {/* clockwise arrowheads between nodes */}
                {arrows.map((a) => (
                  <path
                    key={a}
                    d="M -6 -6 L 7 0 L -6 6"
                    fill="none"
                    stroke="url(#cog-flow)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={`translate(${px(a, RING)} ${py(a, RING)}) rotate(${a})`}
                  />
                ))}

                {/* spokes — every module feeds the core */}
                {stages.map((s) => (
                  <line
                    key={`spoke-${s.name}`}
                    x1={px(s.angle, RING - BUBBLE - 2)}
                    y1={py(s.angle, RING - BUBBLE - 2)}
                    x2={px(s.angle, HUB + 2)}
                    y2={py(s.angle, HUB + 2)}
                    stroke="url(#cog-flow)"
                    strokeOpacity="0.22"
                    strokeWidth="1.4"
                    strokeDasharray="3 5"
                  />
                ))}

                {/* cognition core — the master brain you interact with */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={HUB}
                  fill="url(#cog-hub)"
                  stroke="url(#cog-flow)"
                  strokeWidth="1.5"
                  strokeOpacity="0.75"
                />
                <circle
                  cx={CX}
                  cy={CY}
                  r={HUB - 9}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                  strokeWidth="1"
                />
                <g
                  transform={`translate(${CX} ${CY - 46}) scale(0.82)`}
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <StageIcon kind="brain" />
                </g>
                <text
                  x={CX}
                  y={CY - 8}
                  textAnchor="middle"
                  className="fill-white font-bold"
                  style={{ fontSize: 17 }}
                >
                  {c.coreLabel}
                </text>
                <text
                  x={CX}
                  y={CY + 8}
                  textAnchor="middle"
                  className="fill-violet-300 font-mono"
                  style={{ fontSize: 8.5, letterSpacing: "0.06em" }}
                >
                  {c.coreTagline}
                </text>
                <line
                  x1={CX - 48}
                  y1={CY + 18}
                  x2={CX + 48}
                  y2={CY + 18}
                  stroke="#ffffff"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
                <text
                  x={CX}
                  y={CY + 36}
                  textAnchor="middle"
                  className="fill-slate-400"
                  style={{ fontSize: 11 }}
                >
                  {objective}
                </text>

                {/* input arrowheads — modules flowing into the core */}
                {stages.map((s) => (
                  <path
                    key={`in-${s.name}`}
                    d="M -5 -5 L 6 0 L -5 5"
                    fill="none"
                    stroke="url(#cog-flow)"
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={`translate(${px(s.angle, HUB + 14)} ${py(
                      s.angle,
                      HUB + 14,
                    )}) rotate(${s.angle + 90})`}
                  />
                ))}

                {/* nodes */}
                {stages.map((s) => {
                  const x = px(s.angle, RING);
                  const y = py(s.angle, RING);
                  const lx = px(s.angle, LABEL);
                  const ly = py(s.angle, LABEL);
                  const parts = s.name.split(" / ");
                  return (
                    <g key={s.name}>
                      {/* bubble */}
                      <circle
                        cx={x}
                        cy={y}
                        r={BUBBLE}
                        fill="#0c0c17"
                        stroke="#ffffff"
                        strokeOpacity="0.12"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={BUBBLE}
                        fill="none"
                        stroke="url(#cog-flow)"
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                      />
                      <g
                        transform={`translate(${x} ${y})`}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <StageIcon kind={s.icon} />
                      </g>
                      {/* label */}
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={s.anchor}
                        className="fill-slate-200 font-semibold"
                        style={{ fontSize: 16 }}
                      >
                        {parts.map((p, i) => (
                          <tspan
                            key={p}
                            x={lx}
                            dy={i === 0 ? (parts.length > 1 ? -8 : 5) : 18}
                          >
                            {i === 0 ? p : `/ ${p}`}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </figure>
          </Reveal>

          {/* ---- stage list + boundary callout ---- */}
          <div>
            <ol className="space-y-3">
              {stages.map((s, i) => (
                <Reveal as="li" key={s.name} delay={i * 70}>
                  <div className="card group flex gap-4 p-4 transition-colors hover:border-white/20">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-xs font-semibold text-accent-cyan">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {s.name}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={stages.length * 70}>
              <div className="mt-4 rounded-2xl border border-accent-violet/25 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent/5 p-5">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-violet-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-violet shadow-glow" />
                  {c.boundaryLabel}
                </span>
                <p className="mt-2 text-base font-semibold text-white">
                  {c.boundaryTitle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {c.boundaryBody}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- inline stage icons, drawn centred at (0,0) ---- */
function StageIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "eye":
      return (
        <>
          <path d="M-14 0 C -8 -9 8 -9 14 0 C 8 9 -8 9 -14 0 Z" />
          <circle r="3.4" fill="#e2e8f0" stroke="none" />
        </>
      );
    case "brain":
      return (
        <>
          <path d="M-1 -11 a6.5 6.5 0 0 0 -7 6 a5.5 5.5 0 0 0 -1.5 10 a5.5 5.5 0 0 0 9.5 2" />
          <path d="M1 -11 a6.5 6.5 0 0 1 7 6 a5.5 5.5 0 0 1 1.5 10 a5.5 5.5 0 0 1 -9.5 2" />
          <path d="M0 -10 V 11" strokeOpacity="0.5" />
        </>
      );
    case "tree":
      return (
        <>
          <circle cx="0" cy="-9" r="3" />
          <circle cx="-9" cy="9" r="3" />
          <circle cx="9" cy="9" r="3" />
          <path d="M0 -6 V 0 M0 0 H -9 V 6 M0 0 H 9 V 6" />
        </>
      );
    case "act":
      return (
        <path d="M-7 -9 L 6 -1 L -1 1 L 3 9 L 0 10.5 L -4 2.5 L -9 5 Z" />
      );
    case "loop":
      return (
        <>
          <path d="M10 -4 a10 10 0 1 0 1.5 8" />
          <path d="M11.5 -10 L 11 -3 L 4.5 -4" strokeLinejoin="round" />
        </>
      );
    default:
      return null;
  }
}
