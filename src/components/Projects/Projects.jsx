import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { projectFilters, projects, work } from "../../data/projects";
import useReducedMotion from "../../hooks/useReducedMotion";
import Icon from "../common/Icon";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import "./Projects.css";

const SWAP_DELAY = 250;

function ProjectCard({ project, position }) {
  const hasLink = Boolean(project.url);

  return (
    // The outer element owns the arrival animation and the inner one owns the
    // hover transform, so a finished animation cannot pin the card in place.
    <article className="card" style={{ "--card-delay": `${position * 90}ms` }}>
      <div className={`card__inner ${hasLink ? "card__inner--linked" : ""}`}>
        <div className="card__media">
          <img
            src={project.image}
            alt={project.alt}
            loading="lazy"
            decoding="async"
          />
          <span className="card__veil" aria-hidden="true" />
          <span className="card__index" aria-hidden="true">
            {project.index}
          </span>
          <span className={`card__tag card__tag--${project.type}`}>
            {project.tagLabel}
          </span>
        </div>

        <div className="card__body">
          <h3 className="card__title">{project.title}</h3>
          <p className="card__desc">{project.description}</p>

          <ul className="card__stack">
            {project.stack.map((tech) => (
              <li className="card__tech" key={tech}>
                {tech}
              </li>
            ))}
          </ul>

          {hasLink ? (
            <a
              className="card__link"
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="card__link-text">Open the project</span>
              <span className="card__link-icon" aria-hidden="true">
                <Icon name="arrowUpRight" size={16} />
              </span>
              <span className="sr-only">, opens in a new tab</span>
            </a>
          ) : (
            <p className="card__link card__link--quiet">
              <span className="card__link-text">Walkthrough on request</span>
              <span className="card__link-icon" aria-hidden="true">
                <Icon name="lock" size={15} />
              </span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [leaving, setLeaving] = useState(false);
  const [marker, setMarker] = useState({ left: 0, width: 0, ready: false });

  const tabRefs = useRef({});
  const swapTimer = useRef(0);
  const reduced = useReducedMotion();
  // What the grid is on its way to becoming. During the fade this differs from
  // `filter`, and comparing against `filter` alone would let a click on the
  // button the visitor can see highlighted be thrown away.
  const pendingRef = useRef("all");

  const visible = projects.filter(
    (project) => filter === "all" || project.type === filter,
  );

  // Slide the pill under whichever tab is live, and keep it there when the
  // layout reflows underneath it.
  useLayoutEffect(() => {
    let live = true;

    const measure = () => {
      if (!live) return;
      const node = tabRefs.current[filter];
      if (!node) return;
      setMarker({
        left: node.offsetLeft,
        width: node.offsetWidth,
        ready: true,
      });
    };

    measure();
    window.addEventListener("resize", measure);

    // Web fonts landing after first paint change the tab widths. This promise
    // outlives the effect, hence the flag.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      live = false;
      window.removeEventListener("resize", measure);
    };
  }, [filter]);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  const choose = useCallback((id) => {
    if (id === pendingRef.current) return;
    pendingRef.current = id;
    setLeaving(true);
    window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      setFilter(id);
      setLeaving(false);
    }, reduced ? 0 : SWAP_DELAY);
  }, [reduced]);

  return (
    <section id="work" className="section section--parchment work">
      <div className="shell">
        <div className="work__top">
          <SectionHeading
            eyebrow={work.eyebrow}
            eyebrowTone="moss"
            title={[
              work.title[0],
              { text: work.title[1], accent: "built and designed" },
            ]}
            lede={work.lede}
            tone="light"
            className="work__heading"
          />

          <Reveal variant="left" delay={200} className="work__count">
            <span className="work__count-value">
              {String(projects.length).padStart(2, "0")}
            </span>
            <span className="work__count-label">
              projects
              <br />
              on show
            </span>
          </Reveal>
        </div>

        <Reveal variant="up" delay={80} className="work__filters">
          {/* Plain toggle buttons rather than a tablist. The ARIA tab pattern
              would promise tab panels, aria-controls and arrow key navigation,
              none of which apply to a grid that filters itself in place. */}
          <div className="filters" role="group" aria-label="Filter projects">
            <span
              className="filters__marker"
              aria-hidden="true"
              style={{
                transform: `translateX(${marker.left}px)`,
                width: `${marker.width}px`,
                opacity: marker.ready ? 1 : 0,
              }}
            />
            {projectFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                className={`filters__tab ${filter === item.id ? "is-active" : ""}`}
                ref={(node) => {
                  tabRefs.current[item.id] = node;
                }}
                onClick={() => choose(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="work__showing" aria-live="polite">
            Showing {visible.length} of {projects.length}
          </p>
        </Reveal>

        <div className={`work__grid ${leaving ? "is-leaving" : ""}`}>
          {visible.map((project, index) => (
            <ProjectCard
              key={`${filter}-${project.id}`}
              project={project}
              position={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
