import { cloneElement, useCallback, useEffect, useRef } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import useReducedMotion from "../../hooks/useReducedMotion";

/**
 * Lets a control drift a little towards the pointer as it approaches, then
 * spring back on the way out. Only for devices with a real pointer, and only
 * when the visitor has not asked for calmer motion.
 *
 * The transform is written straight to the node, so hovering never causes a
 * React render. That does mean this wins over any CSS hover transform on the
 * same element, which is the intended trade: the drift replaces the lift.
 */
export default function Magnetic({
  children,
  strength = 0.28,
  max = 14,
  disabled = false,
}) {
  const nodeRef = useRef(null);
  const frame = useRef(0);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const active = finePointer && !reduced;

  const clear = useCallback(() => {
    const node = nodeRef.current;
    if (frame.current) {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    if (node) node.style.transform = "";
  }, []);

  // A button that becomes disabled under the cursor stops firing mouse events,
  // so without this the drift would stay frozen wherever it happened to be at
  // that moment. Same story if the visitor switches on reduced motion mid
  // visit. The `disabled` prop is what makes the first case observable, since
  // the child's own attribute is not something this component can watch.
  useEffect(() => {
    if (!active || disabled) clear();
    return clear;
  }, [active, disabled, clear]);

  const handleMove = useCallback(
    (event) => {
      const node = nodeRef.current;
      if (!node || !active || disabled || node.disabled) return;

      const { clientX, clientY } = event;
      if (frame.current) return;

      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const box = node.getBoundingClientRect();
        const dx = clientX - (box.left + box.width / 2);
        const dy = clientY - (box.top + box.height / 2);
        const x = Math.max(-max, Math.min(max, dx * strength));
        const y = Math.max(-max, Math.min(max, dy * strength));
        node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
    },
    [active, disabled, strength, max],
  );

  if (!active) return children;

  // The child's own ref and mouse handlers are called alongside these rather
  // than replaced, so wrapping something never quietly removes its behaviour.
  const childProps = children.props;

  return cloneElement(children, {
    ref: (node) => {
      nodeRef.current = node;
      // React 19 made ref a normal prop. Reading `children.ref` still works
      // through a deprecation shim but logs a warning, so it is read from
      // props instead.
      const inherited = childProps.ref;
      if (typeof inherited === "function") inherited(node);
      else if (inherited && typeof inherited === "object") {
        inherited.current = node;
      }
    },
    onMouseMove: (event) => {
      childProps.onMouseMove?.(event);
      handleMove(event);
    },
    onMouseLeave: (event) => {
      childProps.onMouseLeave?.(event);
      clear();
    },
    "data-magnetic": "true",
  });
}
