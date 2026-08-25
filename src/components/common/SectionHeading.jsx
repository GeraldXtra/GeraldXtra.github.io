import Reveal from "./Reveal";
import SplitText from "./SplitText";
import "./SectionHeading.css";

/**
 * The eyebrow, headline, rule and standfirst that opens every section.
 * Keeping it in one place is what stops six sections drifting apart.
 */
export default function SectionHeading({
  eyebrow,
  eyebrowTone = "clay",
  title,
  lede,
  tone = "dark",
  align = "start",
  as = "h2",
  className = "",
}) {
  return (
    <header
      className={[
        "heading",
        `heading--${align}`,
        `heading--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? (
        <Reveal variant="up" shift={18}>
          <span className={`eyebrow eyebrow--${eyebrowTone}`}>{eyebrow}</span>
        </Reveal>
      ) : null}

      <SplitText
        as={as}
        lines={title}
        className={`headline ${tone === "light" ? "headline--onlight" : ""}`}
        delay={90}
      />

      <Reveal variant="none" delay={260}>
        <span className={`rule rule--${eyebrowTone} heading__rule`} />
      </Reveal>

      {lede ? (
        <Reveal variant="up" delay={340} shift={18}>
          <p className={`lede ${tone === "light" ? "lede--onlight" : ""}`}>
            {lede}
          </p>
        </Reveal>
      ) : null}
    </header>
  );
}
