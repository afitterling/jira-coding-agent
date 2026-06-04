type Tone =
  | "ready"
  | "revise"
  | "revised"
  | "implemented"
  | "tested"
  | "failed"
  | "qa"
  | "done"
  | "neutral";

const TONES: Record<Tone, string> = {
  ready: "bg-accent-lime/15 text-accent-lime ring-1 ring-inset ring-accent-lime/30",
  revise: "bg-amber-400/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  revised: "bg-amber-300/15 text-amber-200 ring-1 ring-inset ring-amber-300/25",
  implemented:
    "bg-accent/15 text-indigo-300 ring-1 ring-inset ring-accent/30",
  tested: "bg-accent-cyan/15 text-cyan-300 ring-1 ring-inset ring-accent-cyan/30",
  failed: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30",
  qa: "bg-violet-400/15 text-violet-300 ring-1 ring-inset ring-violet-400/30",
  done: "bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
  neutral: "bg-white/5 text-slate-300 ring-1 ring-inset ring-white/10",
};

export function LabelPill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`label-pill ${TONES[tone]} ${className}`}>{children}</span>
  );
}
