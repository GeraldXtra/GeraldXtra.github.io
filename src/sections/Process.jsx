import Route from "../components/Route";
import { STEPS } from "../data/steps";

export default function Process() {
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="wrap">
        <div className="head">
          <h2 id="process-title" className="reveal-wipe">
            How a project runs
          </h2>
          <p className="lede reveal">
            Same rhythm every time, so you always know where things stand and what's coming next.
          </p>
        </div>
        <Route kind="steps">
          <ol className="steps">
            {STEPS.map((step) => (
              <li className="step" key={step.num}>
                <span className="step__num" aria-hidden="true">
                  {step.num}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <p className="step__meta">{step.meta}</p>
              </li>
            ))}
          </ol>
        </Route>
      </div>
    </section>
  );
}
