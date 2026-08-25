const NAV_OFFSET = 74;

/**
 * Sends the page to a section, allowing for the fixed header sitting over it.
 *
 * Anchors still carry a real href so the links keep working, get copied and
 * open in a new tab properly. This only takes over the click when the target
 * is genuinely on the page.
 */
export default function scrollToId(href, offset = NAV_OFFSET) {
  if (typeof href !== "string" || !href.startsWith("#")) return false;

  const node = document.getElementById(href.slice(1));
  if (!node) return false;

  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const top = node.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: reduce ? "auto" : "smooth",
  });

  return true;
}
