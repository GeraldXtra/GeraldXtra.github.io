import { Fragment, useLayoutEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import { PROJECTS } from "../data/projects";
import { offMQ, onMQ, reduceMQ, reduced, whenVisible } from "../utils/motion";

const FILTERS = [
  { key: "all", label: "Everything" },
  { key: "web", label: "Web development" },
  { key: "uiux", label: "UI/UX design" },
];

function listFor(filter) {
  return PROJECTS.filter((p) => filter === "all" || p.type === filter);
}

/* Work showcase: a big frame with the selected project, an index beside it,
   and a progress line that moves to the next project unless you are looking. */
export default function Work() {
  // bar changes on every selection, which remounts the selected tab's progress line and restarts it.
  // shown changes on every filter click, which rewrites the "Showing" line as the reference does.
  const [state, setState] = useState({ active: PROJECTS[0].key, filter: "all", bar: 0, shown: 0 });
  const showcaseRef = useRef(null);
  const tabRefs = useRef({});

  const visible = listFor(state.filter);
  const current = PROJECTS.find((p) => p.key === state.active);

  function select(key, focus) {
    setState((s) => ({ ...s, active: key, bar: s.bar + 1 }));
    if (focus && tabRefs.current[key]) tabRefs.current[key].focus();
  }

  function next() {
    setState((s) => {
      const list = listFor(s.filter);
      if (!list.length) return s;
      const i = list.findIndex((p) => p.key === s.active);
      return { ...s, active: list[(i + 1) % list.length].key, bar: s.bar + 1 };
    });
  }

  function onKeyDown(e, key) {
    const list = visible;
    const i = list.findIndex((p) => p.key === key);
    let n = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = list[(i + 1) % list.length];
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = list[(i - 1 + list.length) % list.length];
    else if (e.key === "Home") n = list[0];
    else if (e.key === "End") n = list[list.length - 1];
    if (n) {
      e.preventDefault();
      select(n.key, true);
    }
  }

  function onFilter(filter) {
    setState((s) => {
      const list = listFor(filter);
      const keep = list.some((p) => p.key === s.active);
      return { filter, active: keep ? s.active : list[0].key, bar: s.bar + 1, shown: s.shown + 1 };
    });
  }

  /* The progress line holds while the showcase is hovered, focused, off screen or the tab is hidden,
     and stays still with reduced motion. These classes are set before the first paint, so the line
     never starts before it should. */
  useLayoutEffect(() => {
    const sc = showcaseRef.current;
    let vis = false;
    let held = false;
    function sync() {
      sc.classList.toggle("is-held", held || !vis || document.hidden);
    }
    function hold() {
      held = true;
      sync();
    }
    function release() {
      held = false;
      sync();
    }
    function still() {
      sc.classList.toggle("is-still", reduced());
    }
    sc.addEventListener("mouseenter", hold);
    sc.addEventListener("mouseleave", release);
    sc.addEventListener("focusin", hold);
    sc.addEventListener("focusout", release);
    const unwatch = whenVisible(
      sc,
      (v) => {
        vis = v;
        sync();
      },
      { threshold: 0.3 },
    );
    document.addEventListener("visibilitychange", sync);
    if (reduced()) sc.classList.add("is-still");
    onMQ(reduceMQ, still);
    sync();
    return () => {
      sc.removeEventListener("mouseenter", hold);
      sc.removeEventListener("mouseleave", release);
      sc.removeEventListener("focusin", hold);
      sc.removeEventListener("focusout", release);
      unwatch();
      document.removeEventListener("visibilitychange", sync);
      offMQ(reduceMQ, still);
      sc.classList.remove("is-held", "is-still");
    };
  }, []);

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="head">
          <h2 id="work-title" className="reveal-wipe">
            Some things I've built and designed
          </h2>
          <p className="lede reveal">Not everything, just the ones worth showing. These say the most about how I work.</p>
        </div>
        <div className="workbar reveal">
          <div className="filters" role="group" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                data-filter={f.key}
                aria-pressed={state.filter === f.key ? "true" : "false"}
                onClick={() => onFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="showing" id="showing" aria-live="polite">
            <Fragment key={state.shown}>{"Showing " + visible.length + " of " + PROJECTS.length}</Fragment>
          </p>
        </div>
        <div className="showcase reveal" id="showcase" ref={showcaseRef}>
          <div className="stage">
            <div className="frame">
              <div className="frame__bar">
                <span className="frame__dot" aria-hidden="true"></span>
                <span className="frame__url" id="frame-url">
                  {current.label}
                </span>
                <span className="frame__count" id="frame-count">
                  {visible.findIndex((p) => p.key === state.active) + 1 + " of " + visible.length}
                </span>
              </div>
              <div className="frame__screen">
                {PROJECTS.map((p) => {
                  const on = p.key === state.active;
                  return (
                    <img
                      key={p.key}
                      className={"frame__img" + (on ? " is-active" : "")}
                      data-key={p.key}
                      src={p.image}
                      width={p.width}
                      height={p.height}
                      alt={p.alt}
                      loading={p.lazy ? "lazy" : undefined}
                      aria-hidden={on ? undefined : "true"}
                      decoding="async"
                    />
                  );
                })}
              </div>
            </div>
            {PROJECTS.map((p) => {
              const on = p.key === state.active;
              return (
                <article
                  key={p.key}
                  className={"pinfo" + (on ? " is-active" : "")}
                  id={"p-" + p.key}
                  role="tabpanel"
                  aria-labelledby={"t-" + p.key}
                  data-key={p.key}
                  hidden={!on}
                >
                  <h3>{p.name}</h3>
                  <span className="project__type">{p.typeLabel}</span>
                  <p className="pinfo__desc">{p.desc}</p>
                  <ul className="stack">
                    {p.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  {p.links ? (
                    <div className="pinfo__links">
                      {p.links.map((l) => (
                        <a key={l.href} className="project__link" href={l.href} target="_blank" rel="noopener noreferrer">
                          {l.text}
                          <span className="sr-only">, opens in a new tab</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="project__link project__link--quiet">
                      <Icon name="lock" />
                      {p.quiet}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <div className="index" role="tablist" aria-label="Projects" aria-orientation="vertical">
            {PROJECTS.map((p) => {
              const on = p.key === state.active;
              return (
                <button
                  key={p.key}
                  ref={(el) => {
                    tabRefs.current[p.key] = el;
                  }}
                  className="idx"
                  type="button"
                  role="tab"
                  id={"t-" + p.key}
                  aria-controls={"p-" + p.key}
                  aria-selected={on ? "true" : "false"}
                  tabIndex={on ? 0 : -1}
                  data-key={p.key}
                  data-type={p.type}
                  data-label={p.label}
                  hidden={!visible.includes(p)}
                  onClick={() => select(p.key)}
                  onKeyDown={(e) => onKeyDown(e, p.key)}
                >
                  <span className="idx__name">{p.name}</span>
                  <span className="idx__type">{p.typeLabel}</span>
                  <span className="idx__bar" aria-hidden="true">
                    <i key={on ? "bar-" + state.bar : "idle"} onAnimationEnd={on ? next : undefined}></i>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
