import { useRef, useState } from "react";

// Free-form agent handoff graph — the same visual as the app's /configure page.
// Jira → agents → Done, drawn with curved connectors carrying the handed-off
// Jira label. Nodes are draggable; deciders show a dashed failure loop back.

const NODE_W = 140;
const NODE_H = 60;

interface PipeAgent {
  id: string;
  name: string;
  role: "processes" | "decides";
  inLabel: string;
  outLabel: string;
  fail?: string;
}

const PIPE: PipeAgent[] = [
  { id: "reviser", name: "Reviser", role: "processes", inLabel: "revise", outLabel: "revised" },
  { id: "implementer", name: "Implementer", role: "processes", inLabel: "ready", outLabel: "implemented" },
  { id: "tester", name: "Tester", role: "decides", inLabel: "implemented", outLabel: "tested", fail: "tests-failed" },
  { id: "qa", name: "QA", role: "decides", inLabel: "tested", outLabel: "done", fail: "qa-failed" },
];

type Tone = "cyan" | "accent" | "violet" | "slate";
interface FNode {
  id: string;
  title: string;
  sub: string;
  tone: Tone;
  fail?: string;
}

const NODES: FNode[] = [
  { id: "jira", title: "Jira", sub: "board", tone: "cyan" },
  ...PIPE.map<FNode>((a) => ({
    id: a.id,
    title: a.name,
    sub: a.role,
    tone: a.role === "decides" ? "violet" : "accent",
    fail: a.fail,
  })),
  { id: "done", title: "Done", sub: "shipped", tone: "slate" },
];

const TONE_RING: Record<Tone, string> = {
  cyan: "border-accent-cyan/50 bg-accent-cyan/10",
  accent: "border-accent/50 bg-accent/10",
  violet: "border-accent-violet/50 bg-accent-violet/10",
  slate: "border-white/15 bg-white/5",
};

export function AgentFlow() {
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const def = (i: number) => ({ x: 16 + i * 150, y: 18 + (i % 2 ? 100 : 0) });
  const idx = (id: string) => NODES.findIndex((n) => n.id === id);
  const at = (id: string) => pos[id] ?? def(idx(id));

  const onDown = (e: React.PointerEvent, id: string) => {
    if (!wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    const p = at(id);
    drag.current = { id, dx: e.clientX - r.left - p.x, dy: e.clientY - r.top - p.y };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - r.left - drag.current.dx);
    const y = Math.max(0, e.clientY - r.top - drag.current.dy);
    setPos((p) => ({ ...p, [drag.current!.id]: { x, y } }));
  };
  const onUp = () => {
    drag.current = null;
  };

  type Edge = { from: string; to: string; label: string; dashed?: boolean };
  const edges: Edge[] = [];
  for (let i = 0; i < NODES.length - 1; i++) {
    const from = NODES[i];
    const label = from.id === "jira" ? PIPE[0].inLabel : PIPE.find((a) => a.id === from.id)?.outLabel ?? "";
    edges.push({ from: from.id, to: NODES[i + 1].id, label });
  }
  PIPE.forEach((a) => {
    if (a.fail) edges.push({ from: a.id, to: NODES[idx(a.id) - 1].id, label: a.fail, dashed: true });
  });

  const anchors = (fromId: string, toId: string) => {
    const f = at(fromId);
    const t = at(toId);
    const forward = t.x >= f.x;
    const a = { x: forward ? f.x + NODE_W : f.x, y: f.y + NODE_H / 2 };
    const b = { x: forward ? t.x : t.x + NODE_W, y: t.y + NODE_H / 2 };
    return { a, b, forward };
  };

  const width = Math.max(520, ...NODES.map((n) => at(n.id).x + NODE_W + 20));
  const height = Math.max(200, ...NODES.map((n) => at(n.id).y + NODE_H + 20));

  return (
    <figure className="card mt-8 p-4">
      <div className="overflow-auto rounded-xl border border-white/10" style={{ maxHeight: 360 }}>
        <div
          ref={wrap}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="relative bg-grid"
          style={{ width, height }}
        >
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            <defs>
              <marker id="afArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="rgb(100 116 139)" />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const { a, b, forward } = anchors(e.from, e.to);
              const dx = Math.max(40, Math.abs(b.x - a.x) / 2);
              const c1x = a.x + (forward ? dx : -dx);
              const c2x = b.x + (forward ? -dx : dx);
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2 + (e.dashed ? 22 : 0);
              return (
                <g key={i}>
                  <path
                    d={`M ${a.x} ${a.y} C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`}
                    fill="none"
                    stroke={e.dashed ? "rgb(248 113 113 / 0.6)" : "rgb(100 116 139 / 0.8)"}
                    strokeWidth="1.5"
                    strokeDasharray={e.dashed ? "5 4" : undefined}
                    markerEnd="url(#afArrow)"
                  />
                  <text x={mx} y={my - 4} textAnchor="middle" className="fill-slate-300 font-mono" style={{ fontSize: 10 }}>
                    #{e.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {NODES.map((n) => {
            const p = at(n.id);
            return (
              <div
                key={n.id}
                onPointerDown={(e) => onDown(e, n.id)}
                className={`absolute grid cursor-grab place-items-center rounded-xl border text-center shadow-card active:cursor-grabbing ${TONE_RING[n.tone]}`}
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H, touchAction: "none" }}
              >
                <span className="text-sm font-semibold text-white">{n.title}</span>
                <span className="font-mono text-[10px] text-slate-400">{n.sub}</span>
                {n.fail && <span className="font-mono text-[9px] text-red-300/80">✗ ↻ #{n.fail}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span>Drag nodes to rearrange — the connections follow.</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> processes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-violet" /> decides
        </span>
      </figcaption>
    </figure>
  );
}
