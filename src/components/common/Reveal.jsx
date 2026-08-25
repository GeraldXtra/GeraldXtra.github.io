import useInView from "../../hooks/useInView";

/**
 * Holds its children just below their resting place until they scroll into
 * view, then lets them settle. The delay is handed to CSS as a custom
 * property so a row of siblings can arrive one after another.
 */
export default function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  threshold = 0.15,
  rootMargin = "0px 0px -6% 0px",
  shift,
  className = "",
  style,
  children,
  ...rest
}) {
  const [ref, inView] = useInView({ threshold, rootMargin });

  return (
    <Tag
      ref={ref}
      className={[
        "reveal",
        `reveal--${variant}`,
        inView ? "is-visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--reveal-delay": `${delay}ms`,
        ...(shift ? { "--reveal-shift": `${shift}px` } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
