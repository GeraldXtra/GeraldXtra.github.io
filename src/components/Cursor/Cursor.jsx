import { useEffect, useRef } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./Cursor.css";

const INTERACTIVE = "a, button, input, textarea, select, [data-cursor]";

/**
 * A two part pointer: a small dot that sits exactly under the mouse and a ring
 * that trails a fraction behind it.
 *
 * Positions are written straight onto the nodes inside a single animation
 * frame loop, so moving the mouse never touches React state.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const enabled = finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { ...target };
    let frame = 0;
    let awake = false;

    const render = () => {
      trail.x += (target.x - trail.x) * 0.16;
      trail.y += (target.y - trail.y) * 0.16;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(render);
    };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!awake) {
        awake = true;
        // The native pointer is only hidden once the replacement is actually
        // on screen. Hiding it at mount would leave a page that has not been
        // touched yet with no pointer at all.
        document.documentElement.classList.add("has-custom-cursor");
        dot.classList.add("is-awake");
        ring.classList.add("is-awake");
      }
    };

    const onOver = (event) => {
      const hit = event.target.closest?.(INTERACTIVE);
      ring.classList.toggle("is-hovering", Boolean(hit));
      dot.classList.toggle("is-hovering", Boolean(hit));
    };

    const onDown = () => ring.classList.add("is-pressed");
    const onUp = () => ring.classList.remove("is-pressed");

    const onLeave = () => {
      dot.classList.remove("is-awake");
      ring.classList.remove("is-awake");
      document.documentElement.classList.remove("has-custom-cursor");
      awake = false;
    };

    frame = window.requestAnimationFrame(render);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <span ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <span ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
