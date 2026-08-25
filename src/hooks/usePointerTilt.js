import { useCallback, useRef } from "react";

export default function usePointerTilt({ max = 7, enabled = true } = {}) {
  const ref = useRef(null);
  const frame = useRef(0);

  const onPointerMove = useCallback(
    (event) => {
      const node = ref.current;
      if (!node || !enabled) return;

      const point = { x: event.clientX, y: event.clientY };

      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const box = node.getBoundingClientRect();
        const px = (point.x - box.left) / box.width;
        const py = (point.y - box.top) / box.height;

        node.style.setProperty("--px", px.toFixed(4));
        node.style.setProperty("--py", py.toFixed(4));
        node.style.setProperty(
          "--tilt-x",
          `${((0.5 - py) * max * 2).toFixed(2)}deg`,
        );
        node.style.setProperty(
          "--tilt-y",
          `${((px - 0.5) * max * 2).toFixed(2)}deg`,
        );
      });
    },
    [max, enabled],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    if (frame.current) {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    node.style.setProperty("--px", "0.5");
    node.style.setProperty("--py", "0.5");
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
