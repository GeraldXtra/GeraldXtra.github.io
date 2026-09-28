import { SKILL_ROWS } from "../data/skills";

export default function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="wrap">
        <div className="head">
          <h2 id="skills-title" className="reveal-wipe">
            Skills and tools
          </h2>
          <p className="lede reveal">What I work with right now. The list grows as I keep working.</p>
        </div>
        <div className="skills">
          {SKILL_ROWS.map((row, i) => (
            <div key={row.title} className="skills__row reveal" style={{ "--i": i }}>
              <h3>{row.title}</h3>
              <ul className="chips">
                {row.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
