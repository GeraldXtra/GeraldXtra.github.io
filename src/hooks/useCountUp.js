import { useEffect, useState } from "react";

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function useCountUp(
  target,
  { duration = 1700, active = true, animate = true } = {},
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    if (!animate || duration <= 0) {
      setValue(target);
      return undefined;
    }

    let frame = 0;
    let started = 0;

    const tick = (now) => {
      if (!started) started = now;
      const elapsed = now - started;
      const progress = Math.min(1, elapsed / duration);
      setValue(Math.round(easeOutExpo(progress) * target));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, duration, active, animate]);

  return value;
}
