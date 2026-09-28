import Icon from "../components/Icon";
import Portrait from "../components/Portrait";
import { yearsWord } from "../utils/time";

export default function Hero({ mapRef }) {
  /* Click or tap an empty part of the hero map and a wave runs out from that spot. */
  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("a, button, input, textarea, label, .hero__main, .legend, .portrait")) return;
    const map = mapRef && mapRef.current;
    if (map && map.pulseAt) map.pulseAt(e.clientX, e.clientY);
  }

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" onPointerDown={onPointerDown}>
      <div className="wrap hero__grid">
        <div className="hero__main">
          <p className="status intro" style={{ "--d": 150 }}>
            <span className="light" aria-hidden="true"></span>
            Available for remote work
          </p>
          <h1 id="hero-title">
            <span className="line">
              <span style={{ "--d": 0 }}>Web & app developer</span>
            </span>
            <span className="line">
              <span style={{ "--d": 1 }}>and UI/UX designer</span>
            </span>
          </h1>
          <p className="hero__intro intro" style={{ "--d": 650 }}>
            I'm a freelance developer and designer based in Lagos. For <span data-years="">{yearsWord()}</span> years
            I've been building websites, apps and products for founders and small teams, doing the design and the code
            myself so nothing falls through the gap between them.
          </p>
          <div className="hero__actions intro" style={{ "--d": 800 }}>
            <a className="btn btn--primary" href="#work">
              See the work
            </a>
            <a className="btn btn--ghost" href="#contact">
              Start a project
            </a>
            <a className="btn btn--link" href="/resume.pdf" download="Eberechukwu-Gerald-Resume.pdf">
              <Icon name="download" />
              Download my resume
            </a>
          </div>
        </div>
        <Portrait />
      </div>
    </section>
  );
}
