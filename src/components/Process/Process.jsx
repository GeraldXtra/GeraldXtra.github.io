import { process } from "../../data/process";
import useInView from "../../hooks/useInView";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import "./Process.css";

/**
 * One stage on the timeline. The node on the spine lights up as the row
 * arrives, which is what makes the line feel like it is being drawn rather
 * than sitting there already finished.
 */
function Step({ step, index }) {
  const [ref, inView] = useInView({ threshold: 0.35 });

  return (
    <li
      ref={ref}
      className={`step ${inView ? "is-visible" : ""}`}
      style={{ "--step-delay": `${index * 90}ms` }}
    >
      <div className="step__spine" aria-hidden="true">
        <span className="step__node">
          <span className="step__node-core" />
        </span>
        <span className="step__thread" />
      </div>

      <div className="step__content">
        <span className="step__number" aria-hidden="true">
          {step.step}
        </span>
        <h3 className="step__title">{step.title}</h3>
        <p className="step__body">{step.body}</p>
        <p className="step__meta">
          <span className="step__meta-mark" aria-hidden="true" />
          {step.meta}
        </p>
      </div>
    </li>
  );
}

export default function Process() {
  return (
    <section id="process" className="section section--dark process">
      <div className="shell">
        <SectionHeading
          eyebrow={process.eyebrow}
          eyebrowTone="brass"
          title={[
            process.title[0],
            { text: process.title[1], accent: "no surprises" },
          ]}
          lede={process.lede}
        />

        <Reveal variant="up" delay={60}>
          <ol className="process__list">
            {process.steps.map((step, index) => (
              <Step key={step.id} step={step} index={index} />
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
