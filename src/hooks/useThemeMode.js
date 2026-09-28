import { useSyncExternalStore } from "react";
import { darkMQ, offMQ, onMQ } from "../utils/motion";

/* Theme toggle. Follows the device until the visitor picks one. */
function activeTheme() {
  const a = document.documentElement.getAttribute("data-theme");
  return a === "light" || a === "dark" ? a : darkMQ.matches ? "dark" : "light";
}

function subscribe(fn) {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  onMQ(darkMQ, fn);
  return () => {
    mo.disconnect();
    offMQ(darkMQ, fn);
  };
}

function toggle() {
  const next = activeTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("gerald-theme", next);
  } catch {
    /* storage can be blocked; the choice still holds for this visit */
  }
}

/* Returns [mode, toggle], where mode is "light" or "dark". */
export default function useThemeMode() {
  const mode = useSyncExternalStore(subscribe, activeTheme);
  return [mode, toggle];
}
