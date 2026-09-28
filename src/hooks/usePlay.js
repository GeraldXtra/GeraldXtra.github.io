import { useLayoutEffect } from "react";
import { reduced, whenVisible } from "../utils/motion";

/* Looping pieces (the service scenes) only run while they are on screen. The element gets
   is-paused otherwise, and an SMIL svg inside it is paused and resumed with it. With reduced
   motion the svg is parked at 3.7 s and paused. This runs before the first paint, as the
   reference does, so no scene plays a frame before it is paused. */
export default function usePlay(ref) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const svg = el.querySelector("svg.smil");
    let vis = false;
    function set() {
      const play = vis && !document.hidden && !reduced();
      el.classList.toggle("is-paused", !play);
      if (svg && svg.pauseAnimations) {
        if (reduced()) {
          try {
            svg.setCurrentTime(3.7);
          } catch (e) {
            /* ignored, as in the reference */
          }
          svg.pauseAnimations();
        } else if (play) svg.unpauseAnimations();
        else svg.pauseAnimations();
      }
    }
    set();
    const unwatch = whenVisible(el, (v) => {
      vis = v;
      set();
    });
    document.addEventListener("visibilitychange", set);
    return () => {
      unwatch();
      document.removeEventListener("visibilitychange", set);
    };
  }, [ref]);
}
