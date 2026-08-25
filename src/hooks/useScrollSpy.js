import { useEffect, useState } from "react";

export default function useScrollSpy(ids, { band = "-45% 0px -50% 0px" } = {}) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|").filter(Boolean);
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!nodes.length || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        // Keep document order so overlapping matches resolve predictably.
        const winner = sectionIds.find((id) => visible.has(id));
        if (winner) setActiveId(winner);
      },
      { rootMargin: band, threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));

    // Sitting at the very top should always light up the first entry.
    const onScroll = () => {
      if (window.scrollY < 80) setActiveId(sectionIds[0]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key, band]);

  return activeId;
}
