import { about, profile } from "../../data/profile";
import useCountUp from "../../hooks/useCountUp";
import useInView from "../../hooks/useInView";
import useReducedMotion from "../../hooks/useReducedMotion";
import Icon from "../common/Icon";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import "./About.css";

/**
 * One figure that counts itself up the first time it is seen. The same
 * observer drives both the arrival and the count, so they always agree.
 */
function Stat({ value, suffix, label, delay }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const reduced = useReducedMotion();
  const shown = useCountUp(value, { active: inView, animate: !reduced });

  // Deliberately not reusing the shared `.reveal` classes here. Both that rule
  // and `.stat` would set `transition` at equal specificity, and whichever
  // landed later would silently drop the other's properties.
  return (
    <div
      ref={ref}
      className={`stat ${inView ? "is-visible" : ""}`}
      style={{ "--stat-delay": `${delay}ms` }}
    >
      <p className="stat__value">
        {shown}
        <span className="stat__suffix">{suffix}</span>
      </p>
      <p className="stat__label">{label}</p>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="section section--light about">
      <div className="shell about__grid">
        <div className="about__body">
          <SectionHeading
            eyebrow={about.eyebrow}
            eyebrowTone="moss"
            title={[
              about.title[0],
              { text: about.title[1], accent: "the work" },
            ]}
            tone="light"
          />

          {about.paragraphs.map((text, index) => (
            <Reveal
              as="p"
              key={index}
              variant="up"
              delay={index * 90}
              shift={20}
              className={`about__para ${index === 0 ? "about__para--lead" : ""}`}
            >
              {text}
            </Reveal>
          ))}

          <div className="about__stats">
            {about.stats.map((stat, index) => (
              <Stat key={stat.label} {...stat} delay={index * 110} />
            ))}
          </div>
        </div>

        <Reveal variant="right" delay={140} className="about__aside">
          <article className="idcard">
            <span className="idcard__seam" aria-hidden="true" />

            <header className="idcard__head">
              <p className="idcard__name">{profile.fullName}</p>
              <p className="idcard__role">{about.card.role}</p>
            </header>

            <dl className="idcard__rows">
              {about.card.rows.map((row) => (
                <div className="idcard__row" key={row.label}>
                  <span className="idcard__icon" aria-hidden="true">
                    <Icon name={row.icon} size={17} />
                  </span>
                  <div className="idcard__text">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <footer className="idcard__foot">
              <span className="idcard__pulse" aria-hidden="true" />
              Taking on new work this quarter
            </footer>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
