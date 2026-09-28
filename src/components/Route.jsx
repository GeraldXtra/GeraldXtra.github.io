import { useEffect, useRef } from "react";
import { clamp, debounce, reduced, whenVisible } from "../utils/motion";

/* Route lights: a tail light drives along the timeline and the process, lighting each stop.
   The light's opacity and position and each stop's is-lit class are written straight to the DOM. */
export default function Route({ kind, children }) {
  const wrapRef = useRef(null);
  const lightRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const light = lightRef.current;
    if (!wrap) return undefined;
    const stops = Array.from(wrap.querySelectorAll(kind === "steps" ? ".step" : ".timeline li"));
    if (!light || stops.length < 2) return undefined;
    const hold = 1.8;
    let pts = [];
    let segs = [0];
    let L = 0;
    let mode = "line";
    let travel = 4;
    let t = 0;
    let last = 0;
    let raf = 0;
    let vis = false;
    let disposed = false;

    function anchor(stop) {
      if (kind === "steps") {
        const n = stop.querySelector(".step__num").getBoundingClientRect();
        return { x: n.left + n.width / 2, y: n.top + n.height / 2 };
      }
      const r = stop.getBoundingClientRect();
      return { x: r.left + 9, y: r.top + 9 };
    }

    function measure() {
      const w = wrap.getBoundingClientRect();
      pts = stops.map((s) => {
        const a = anchor(s);
        return { x: a.x - w.left, y: a.y - w.top };
      });
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const dx = Math.max(...xs) - Math.min(...xs);
      const dy = Math.max(...ys) - Math.min(...ys);
      mode = dy < 6 || dx < 6 ? "line" : "grid";
      segs = [0];
      L = 0;
      for (let i = 1; i < pts.length; i++) {
        L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        segs.push(L);
      }
      travel = Math.max(3.2, L / 150);
    }

    function lightAt(d) {
      for (let i = 1; i < pts.length; i++) {
        if (d <= segs[i] || i === pts.length - 1) {
          const span = segs[i] - segs[i - 1] || 1;
          const f = clamp((d - segs[i - 1]) / span, 0, 1);
          return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f };
        }
      }
      return pts[0];
    }

    function paint() {
      if (mode === "line") {
        const d = Math.min(1, t / travel) * L;
        const pos = lightAt(d);
        const end = travel + hold;
        const op = t < 0.35 ? t / 0.35 : t > end - 0.5 ? Math.max(0, (end - t) / 0.5) : 1;
        light.style.opacity = op.toFixed(2);
        light.style.transform = "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px)";
        stops.forEach((s, i) => s.classList.toggle("is-lit", segs[i] <= d + 2 && t < end - 0.3));
      } else {
        light.style.opacity = "0";
        const idx = Math.floor(t / 1.4) % stops.length;
        stops.forEach((s, i) => s.classList.toggle("is-lit", i === idx));
      }
    }

    function frame(now) {
      raf = 0;
      if (!vis || document.hidden || reduced()) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      t += dt;
      const loop = mode === "line" ? travel + hold : stops.length * 1.4;
      if (t > loop) t = 0;
      paint();
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (raf || reduced()) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (!document.hidden && vis) play();
    }

    measure();
    const onResize = debounce(measure, 200);
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) measure();
      });
    }
    const unwatch = whenVisible(wrap, (v) => {
      vis = v;
      if (v) {
        measure();
        play();
      }
    });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      onResize.cancel();
      window.removeEventListener("resize", onResize);
      unwatch();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind]);

  return (
    <div className="route reveal" data-route={kind} ref={wrapRef}>
      {children}
      <span className="route__light" aria-hidden="true" ref={lightRef}></span>
    </div>
  );
}
