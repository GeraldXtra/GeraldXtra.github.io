import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { debounce, reduced, whenVisible } from "../utils/motion";

/* The photo is found at build time: the first of these that exists in src/assets is used. */
const photos = import.meta.glob("../assets/portrait.{jpg,jpeg,png,webp}", { eager: true, import: "default" });
const PHOTO = ["jpg", "jpeg", "png", "webp"].map((ext) => photos["../assets/portrait." + ext]).find(Boolean) || null;

/* The flowing red line artwork in the portrait frame, drawn live. Returns a function that stops it. */
function waveArt(cv, lines, cy) {
  const ctx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const t0 = performance.now();
  let w = 0;
  let h = 0;
  let raf = 0;
  let vis = false;
  function size() {
    const r = cv.getBoundingClientRect();
    w = r.width;
    h = r.height;
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
  }
  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1;
    for (let i = 0; i < lines; i++) {
      const f = i / (lines - 1);
      const c = 1 - Math.abs(f - 0.5) * 2;
      ctx.beginPath();
      for (let x = -12; x <= w + 12; x += 6) {
        const u = x / Math.max(w, 1);
        const spread = (0.3 + 0.7 * Math.pow(Math.sin(u * 3.1 + t * 0.32), 2)) * h * 0.013;
        const y =
          h * cy +
          Math.sin(u * 5.2 + t * 0.55) * h * 0.14 +
          Math.sin(u * 11 - t * 0.8 + i * 0.07) * h * 0.035 +
          (i - lines / 2) * spread;
        if (x === -12) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,77,61," + (0.07 + 0.5 * c * c).toFixed(3) + ")";
      ctx.stroke();
    }
  }
  function loop(now) {
    raf = 0;
    if (!vis || document.hidden || reduced()) return;
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  }
  function onVisibility() {
    if (!document.hidden && vis && !raf && !reduced()) raf = requestAnimationFrame(loop);
  }
  const onResize = debounce(() => {
    size();
    draw((performance.now() - t0) / 1000);
  }, 200);

  /* The first frame doubles as the still frame for reduced motion. */
  size();
  draw(2);
  window.addEventListener("resize", onResize);
  const stopWatching = whenVisible(cv, (v) => {
    vis = v;
    if (v && !raf && !reduced()) raf = requestAnimationFrame(loop);
  });
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    cancelAnimationFrame(raf);
    raf = 0;
    vis = false;
    stopWatching();
    window.removeEventListener("resize", onResize);
    onResize.cancel();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

export default function Portrait() {
  const [failed, setFailed] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const hasPhoto = Boolean(PHOTO) && !failed;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    return waveArt(cv, 24, 0.7);
  }, []);

  /* If the photo can't load, the frame falls back to the monogram card. */
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <figure className={hasPhoto ? "portrait intro has-photo" : "portrait intro"} style={{ "--d": 1050 }}>
      <div className="portrait__frame">
        <div className="portrait__fallback" aria-hidden="true">
          <canvas className="portrait__waves" ref={canvasRef}></canvas>
          <Logo className="portrait__mono" />
        </div>
        {hasPhoto && (
          <img
            className="portrait__img"
            ref={imgRef}
            src={PHOTO}
            alt="Portrait of Eberechukwu Gerald"
            onError={() => setFailed(true)}
          />
        )}
        <span className="portrait__pin">
          <i></i>
          Lagos, NG
        </span>
        <span className="crop crop--tl"></span>
        <span className="crop crop--tr"></span>
        <span className="crop crop--bl"></span>
        <span className="crop crop--br"></span>
      </div>
      <figcaption className="portrait__cap">
        <b>Eberechukwu Gerald</b>
        <span>Developer and designer, based in Lagos.</span>
      </figcaption>
    </figure>
  );
}
