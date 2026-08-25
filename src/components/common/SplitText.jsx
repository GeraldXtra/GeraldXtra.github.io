import useInView from "../../hooks/useInView";

/**
 * Breaks a heading into lines and words so each word can tilt up from behind
 * its own mask. A line may nominate part of itself as the accent, which is the
 * italic phrase the eye should land on.
 *
 * A line is either a plain string, or { text, accent } where accent is `true`
 * for the whole line or the exact phrase inside it to emphasise.
 */
function toWords(line) {
  const text = typeof line === "string" ? line : line.text;
  const accent = typeof line === "string" ? null : line.accent;

  let from = -1;
  let to = -1;
  if (accent === true) {
    from = 0;
    to = text.length;
  } else if (typeof accent === "string" && accent.length) {
    from = text.indexOf(accent);
    to = from >= 0 ? from + accent.length : -1;
  }

  const words = [];
  let cursor = 0;

  text.split(/(\s+)/).forEach((chunk) => {
    if (chunk.trim().length) {
      words.push({
        text: chunk,
        accent: from >= 0 && cursor >= from && cursor + chunk.length <= to,
      });
    }
    cursor += chunk.length;
  });

  return words;
}

export default function SplitText({
  as: Tag = "h2",
  lines,
  delay = 0,
  stagger = 62,
  className = "",
  style,
  ...rest
}) {
  const [ref, inView] = useInView({
    threshold: 0.25,
    rootMargin: "0px 0px -4% 0px",
  });

  const list = Array.isArray(lines) ? lines : [lines];
  const readable = list
    .map((line) => (typeof line === "string" ? line : line.text))
    .join(" ");

  // Words carry on counting across line breaks so the stagger reads as one
  // continuous sweep rather than restarting on every line.
  let counter = 0;

  return (
    <Tag
      ref={ref}
      className={["split", inView ? "is-visible" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label={readable}
      {...rest}
    >
      {list.map((line, lineIndex) => {
        const words = toWords(line);
        return (
          <span className="split__line" key={lineIndex} aria-hidden="true">
            {words.map((word, wordIndex) => {
              const wordDelay = delay + counter * stagger;
              counter += 1;
              return (
                <span
                  key={`${lineIndex}-${wordIndex}`}
                  className={
                    word.accent
                      ? "split__word split__word--accent"
                      : "split__word"
                  }
                  style={{ "--word-delay": `${wordDelay}ms` }}
                >
                  {word.text}
                  {wordIndex < words.length - 1 ? "\u00a0" : ""}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
