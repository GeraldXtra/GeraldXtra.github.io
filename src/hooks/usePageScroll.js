import { useEffect, useState } from "react";

/**
 * One scroll listener for the whole page, throttled to the frame rate.
 *
 * How far down the page the visitor is changes on almost every frame. Holding
 * that in React state would re render the entire tree sixty times a second for
 * the sake of two bars, so it is written straight onto the document as the
 * custom property `--scroll-progress` and read from CSS instead.
 *
 * Only the two booleans live in state, and they flip a handful of times per
 * visit rather than continuously.
 */
export default function usePageScroll({
  scrolledAfter = 40,
  deepAfter = 520,
} = {}) {
  const [flags, setFlags] = useState({ scrolled: false, deep: false });

  useEffect(() => {
    let frame = 0;
    const root = document.documentElement;

    const measure = () => {
      frame = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      const reach = root.scrollHeight - window.innerHeight;
      const progress = reach > 0 ? Math.min(1, Math.max(0, y / reach)) : 0;

      root.style.setProperty("--scroll-progress", progress.toFixed(4));

      setFlags((prev) => {
        const scrolled = y > scrolledAfter;
        const deep = y > deepAfter;
        if (prev.scrolled === scrolled && prev.deep === deep) return prev;
        return { scrolled, deep };
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    // Sections growing or shrinking changes the reach without any scrolling,
    // which would otherwise leave the bar reporting a stale figure.
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(schedule);
      observer.observe(document.body);
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      root.style.removeProperty("--scroll-progress");
    };
  }, [scrolledAfter, deepAfter]);

  return flags;
}
