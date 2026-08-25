import portrait from "../../assets/images/portrait.jpeg";
import { hero, profile } from "../../data/profile";
import usePointerTilt from "../../hooks/usePointerTilt";
import useReducedMotion from "../../hooks/useReducedMotion";
import useMediaQuery from "../../hooks/useMediaQuery";
import useTypewriter from "../../hooks/useTypewriter";
import scrollToId from "../../utils/scrollToId";
import Icon from "../common/Icon";
import Magnetic from "../common/Magnetic";
import "./Hero.css";

export default function Hero({ ready }) {
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  const typed = useTypewriter(hero.typedPhrases, {
    start: ready,
    animate: !reduced,
    startDelay: 900,
  });

  const tilt = usePointerTilt({ max: 6, enabled: finePointer && !reduced });

  const go = (event, href) => {
    event.preventDefault();
    scrollToId(href);
  };

  return (
    <section id="hero" className={`hero ${ready ? "is-ready" : ""}`}>
      <div className="hero__field" aria-hidden="true">
        <span className="hero__rule hero__rule--a" />
        <span className="hero__rule hero__rule--b" />
        <span className="hero__rule hero__rule--c" />
        <span className="hero__glow" />
      </div>

      <div className="hero__inner shell">
        <div className="hero__copy">
          <p className="hero__status" style={{ "--in": "80ms" }}>
            <span className="hero__status-dot" />
            {hero.status}
          </p>

          <h1 className="hero__title">
            <span className="hero__title-line" style={{ "--in": "180ms" }}>
              <span className="hero__title-inner">
                {hero.titleLines[0].text}
              </span>
            </span>
            <span className="hero__title-line" style={{ "--in": "300ms" }}>
              <span className="hero__title-inner">
                <span className="hero__amp">{hero.titleLines[1].lead}</span>{" "}
                <em>{hero.titleLines[1].accent}</em>
              </span>
            </span>
          </h1>

          <p className="hero__typed" style={{ "--in": "440ms" }}>
            <span className="hero__typed-prefix">{hero.typedPrefix}</span>{" "}
            {/* The visible value is a half typed fragment on almost every
                frame, so it is hidden from assistive tech and the full list of
                phrases is read out once instead. */}
            <span className="hero__typed-value" aria-hidden="true">
              {typed}
            </span>
            <span className="hero__caret" aria-hidden="true" />
            <span className="sr-only">{hero.typedPhrases.join(", ")}</span>
          </p>

          <p className="hero__intro" style={{ "--in": "560ms" }}>
            {hero.intro}
          </p>

          <div className="hero__actions" style={{ "--in": "680ms" }}>
            <Magnetic strength={0.24} max={12}>
              <a
                href={hero.primaryCta.href}
                className="btn btn--solid"
                onClick={(event) => go(event, hero.primaryCta.href)}
              >
                <span className="btn__label">
                  {hero.primaryCta.label}
                  <Icon name="arrowRight" size={16} />
                </span>
              </a>
            </Magnetic>

            <Magnetic strength={0.2} max={10}>
              <a
                href={hero.secondaryCta.href}
                className="btn btn--outline"
                onClick={(event) => go(event, hero.secondaryCta.href)}
              >
                <span className="btn__label">{hero.secondaryCta.label}</span>
              </a>
            </Magnetic>
          </div>

          <a
            href="#about"
            className="hero__scroll"
            style={{ "--in": "820ms" }}
            onClick={(event) => go(event, "#about")}
          >
            <span className="hero__scroll-track" aria-hidden="true">
              <span className="hero__scroll-bead" />
            </span>
            Scroll to read on
          </a>
        </div>

        <div className="hero__portrait" style={{ "--in": "540ms" }}>
          <div
            className="hero__frame"
            ref={tilt.ref}
            onMouseMove={tilt.onPointerMove}
            onMouseLeave={tilt.onPointerLeave}
          >
            <img
              src={portrait}
              alt={`${profile.fullName}, ${profile.role}`}
              width="680"
              height="850"
              fetchPriority="high"
              decoding="async"
            />
            <span className="hero__frame-sheen" aria-hidden="true" />
            <span className="hero__frame-corner" aria-hidden="true" />
          </div>

          <span className="hero__chip">{hero.portraitBadge}</span>
          <span className="hero__thread" aria-hidden="true" />
          <span className="hero__stamp" aria-hidden="true">
            {profile.initials}
          </span>
        </div>
      </div>

      <span className="hero__timeline" aria-hidden="true">
        {profile.timeline}
      </span>
    </section>
  );
}
