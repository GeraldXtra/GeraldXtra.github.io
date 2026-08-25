import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gerald-theme";

/**
 * Reads whatever the inline script in index.html already worked out, so React
 * and the DOM start in agreement. Falling back to the system preference here
 * as well keeps the hook honest if that script is ever removed.
 */
function readTheme() {
  if (typeof document === "undefined") return "dark";

  const stamped = document.documentElement.getAttribute("data-theme");
  if (stamped === "light" || stamped === "dark") return stamped;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Private browsing can refuse storage entirely. Not worth failing over.
  }

  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Owns which theme is showing.
 *
 * Three things can decide it, in order of authority: a choice the visitor has
 * made before, the operating system preference, and failing both, dark.
 *
 * Once someone picks a theme by hand their choice sticks, and the site stops
 * following the system. Until then it keeps following, so a machine that
 * switches to light in the morning takes the site with it.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(readTheme);
  const [chosen, setChosen] = useState(() => {
    try {
      return Boolean(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Follow the system only while the visitor has not overridden it.
  useEffect(() => {
    if (chosen || !window.matchMedia) return undefined;
    const list = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (event) => setTheme(event.matches ? "light" : "dark");
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [chosen]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The theme still applies for this visit, it just will not be recalled.
      }
      return next;
    });
    setChosen(true);
  }, []);

  return { theme, toggle };
}
