/* Shared motion helpers, ported from the design's app.js. */

export const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
export const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");
export const fineMQ = window.matchMedia("(hover: hover) and (pointer: fine)");

export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

export function onMQ(mq, fn) {
  if (mq.addEventListener) mq.addEventListener("change", fn);
  else if (mq.addListener) mq.addListener(fn);
}

export function offMQ(mq, fn) {
  if (mq.removeEventListener) mq.removeEventListener("change", fn);
  else if (mq.removeListener) mq.removeListener(fn);
}

export function reduced() {
  return reduceMQ.matches;
}

/* The returned function also has cancel(), so an unmount can drop a pending call. */
export function debounce(fn, ms) {
  let t = 0;
  function debounced() {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  }
  debounced.cancel = () => clearTimeout(t);
  return debounced;
}

/* Calls cb(isIntersecting) as el comes and goes. Returns a function that stops watching. */
export function whenVisible(el, cb, opts) {
  if (!el) return () => {};
  if (!("IntersectionObserver" in window)) {
    cb(true);
    return () => {};
  }
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => cb(e.isIntersecting)),
    opts || { rootMargin: "80px 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}
