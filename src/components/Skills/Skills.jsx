import { skills } from "../../data/skills";
import useCountUp from "../../hooks/useCountUp";
import useInView from "../../hooks/useInView";
import useReducedMotion from "../../hooks/useReducedMotion";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import "./Skills.css";

/**
 * A single meter. The track fills and the figure climbs off the same
 * observer, so the number always matches what the bar is showing.
 */
function SkillBar({ name, level, accent, delay }) {
  const [ref, inView] = useInView({ threshold: 0.45 });
  const reduced = useReducedMotion();
  const shown = useCountUp(level, {
    active: inView,
    animate: !reduced,
    duration: 1400,
  });

  return (
    <div className="meter" ref={ref}>
      <div className="meter__top">
        <span className="meter__name">{name}</span>
        <span className="meter__value">{shown}%</span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
      >
        <span
          className={`meter__fill meter__fill--${accent}`}
          style={{
            width: inView ? `${level}%` : "0%",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section section--deep skills">
      <div className="shell">
        <SectionHeading
          eyebrow={skills.eyebrow}
          eyebrowTone="brass"
          title={[skills.title[0], { text: skills.title[1], accent: true }]}
          lede={skills.lede}
        />

        <div className="skills__grid">
          {skills.columns.map((column, columnIndex) => (
            <Reveal
              key={column.id}
              variant="up"
              delay={columnIndex * 130}
              className="skills__column"
            >
              <h3 className={`skills__label skills__label--${column.accent}`}>
                {column.title}
              </h3>

              <div className="skills__meters">
                {column.bars.map((bar, barIndex) => (
                  <SkillBar
                    key={bar.name}
                    name={bar.name}
                    level={bar.level}
                    accent={column.accent}
                    delay={barIndex * 110}
                  />
                ))}
              </div>

              <h4 className="skills__subhead">{column.groupTitle}</h4>
              <ul className="skills__chips">
                {column.chips.map((chip, chipIndex) => (
                  <li
                    className="chip skills__chip"
                    key={chip}
                    style={{ "--chip-delay": `${chipIndex * 55}ms` }}
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
