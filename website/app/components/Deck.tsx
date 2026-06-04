import { useCallback, useEffect, useState } from "react";

/**
 * Turns the one-page site into a click-through deck: clicking anywhere (that
 * isn't a link/button/text selection) advances to the next section, as do the
 * arrow / space / page keys. A fixed indicator shows progress and lets you jump.
 *
 * Fully client-side and SSR-safe — renders nothing until mounted.
 */
export function Deck() {
  const [mounted, setMounted] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [hintGone, setHintGone] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    setIds(sections.map((s) => s.id));
  }, []);

  const elements = useCallback(
    () => ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[],
    [ids],
  );

  const goTo = useCallback(
    (i: number) => {
      const list = elements();
      if (!list.length) return;
      const idx = Math.max(0, Math.min(list.length - 1, i));
      list[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHintGone(true);
    },
    [elements],
  );

  // Track which section we're on as the user scrolls.
  useEffect(() => {
    if (!ids.length) return;
    const onScroll = () => {
      const list = elements();
      const mark = window.scrollY + window.innerHeight * 0.35;
      let idx = 0;
      list.forEach((el, i) => {
        if (el.offsetTop <= mark) idx = i;
      });
      setCurrent(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, elements]);

  // Click-to-advance + keyboard navigation.
  useEffect(() => {
    if (ids.length < 2) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Don't hijack interactive elements, the header, or opt-out regions.
      if (t.closest("a,button,input,select,textarea,label,[role='button'],header,[data-no-advance]"))
        return;
      // Don't fight text selection.
      if (window.getSelection()?.toString()) return;
      goTo(current + 1);
    };

    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        goTo(current + 1);
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goTo(current - 1);
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [ids, current, goTo]);

  if (!mounted || ids.length < 2) return null;
  const atStart = current <= 0;
  const atEnd = current >= ids.length - 1;

  return (
    <>
      {/* Right-edge progress dots — click to jump */}
      <nav
        aria-label="Section navigation"
        data-no-advance
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
      >
        {ids.map((id, i) => (
          <button
            key={id}
            type="button"
            aria-label={`Go to section ${i + 1}`}
            aria-current={i === current}
            onClick={() => goTo(i)}
            className="group grid place-items-center"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === current
                  ? "h-5 w-1.5 bg-accent shadow-glow"
                  : "h-1.5 w-1.5 bg-white/25 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Bottom-right counter + prev/next */}
      <div
        data-no-advance
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/80 px-2 py-1.5 backdrop-blur-xl"
      >
        <button
          type="button"
          aria-label="Previous section"
          disabled={atStart}
          onClick={() => goTo(current - 1)}
          className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:opacity-30"
        >
          <Chevron dir="up" />
        </button>
        <span className="select-none font-mono text-xs tabular-nums text-slate-400">
          {String(current + 1).padStart(2, "0")}
          <span className="text-slate-600"> / {String(ids.length).padStart(2, "0")}</span>
        </span>
        <button
          type="button"
          aria-label="Next section"
          disabled={atEnd}
          onClick={() => goTo(current + 1)}
          className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:opacity-30"
        >
          <Chevron dir="down" />
        </button>
      </div>

      {/* First-run hint */}
      {!hintGone && !atEnd && (
        <div
          data-no-advance
          className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-ink-900/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 backdrop-blur-xl"
        >
          Click anywhere or press <span className="text-accent">→</span> to advance
        </div>
      )}
    </>
  );
}

function Chevron({ dir }: { dir: "up" | "down" }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d={dir === "up" ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
