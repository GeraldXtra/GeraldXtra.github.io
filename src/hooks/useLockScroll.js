import { useEffect } from "react";

export default function useLockScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const previousPadding = body.style.paddingRight;

    body.classList.add("is-locked");
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.classList.remove("is-locked");
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}
