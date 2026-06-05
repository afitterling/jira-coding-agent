import { useCallback, useEffect, useState } from "react";

import { useT } from "~/i18n/context";

/**
 * Turns the one-page site into a click-through deck: clicking anywhere (that
 * isn't a link/button/text selection) advances to the next section, as do the
 * arrow / space / page keys. A fixed indicator shows progress and lets you jump.
 *
 * Fully client-side and SSR-safe — renders nothing until mounted.
 */
export function Deck() {
  const { t } = useT();
  const d = t.deck;
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

  // Mouse-wheel navigation: one gesture = one section. Tall sections still
  // scroll natively until you reach their edge, then the wheel jumps.
  useEffect(() => {
    if (ids.length < 2) return;
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      if (locked) {
        e.preventDefault();
        return;
      }
      const el = elements()[current];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const EPS = 6;
      const down = e.deltaY > 0;
      if (down) {
        if (rect.bottom > vh + EPS) return; // more of this section to read
        if (current >= ids.length - 1) return;
        e.preventDefault();
        locked = true;
        goTo(current + 1);
        window.setTimeout(() => (locked = false), 850);
      } else {
        if (rect.top < -EPS) return; // more of this section above
        if (current <= 0) return;
        e.preventDefault();
        locked = true;
        goTo(current - 1);
        window.setTimeout(() => (locked = false), 850);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [ids, current, elements, goTo]);

  if (!mounted || ids.length < 2) return null;
  const atStart = current <= 0;
  const atEnd = current >= ids.length - 1;

  return (
    <>
      {/* Right-edge progress dots — click to jump */}
      <nav
        aria-label={d.sectionNavAria}
        data-no-advance
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
      >
        {ids.map((id, i) => (
          <button
            key={id}
            type="button"
            aria-label={`${d.goToSection} ${i + 1}`}
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

      {/* Bottom-right counter + prev/next handle (always visible) */}
      <div
        data-no-advance
        className="fixed bottom-5 right-5 z-40 flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/80 px-2 py-1.5 shadow-card backdrop-blur-xl"
      >
        <button
          type="button"
          aria-label={d.prev}
          disabled={atStart}
          onClick={() => goTo(current - 1)}
          className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:opacity-30"
        >
          <Chevron dir="up" />
        </button>
        <span className="select-none px-1 font-mono text-xs tabular-nums text-slate-400">
          {String(current + 1).padStart(2, "0")}
          <span className="text-slate-600"> / {String(ids.length).padStart(2, "0")}</span>
        </span>
        <button
          type="button"
          aria-label={d.next}
          disabled={atEnd}
          onClick={() => goTo(current + 1)}
          className="flex items-center gap-1 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-white transition-colors enabled:hover:bg-accent disabled:opacity-30"
        >
          {d.nextLabel}
          <Chevron dir="down" />
        </button>
      </div>

      {/* First-run hint — prominent, animated, until the first advance */}
      {!hintGone && !atEnd && (
        <div
          data-no-advance
          className="pointer-events-none fixed bottom-10 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="rounded-full border border-accent/40 bg-ink-900/85 px-4 py-2 text-center font-mono text-xs uppercase tracking-[0.18em] text-slate-200 shadow-glow backdrop-blur-xl">
            {d.hintP1}<span className="text-accent">↓</span>{d.hintP2}
          </span>
          <span className="grid h-8 w-8 animate-bounce place-items-center rounded-full border border-accent/40 bg-ink-900/85 text-accent backdrop-blur-xl">
            <Chevron dir="down" />
          </span>
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
