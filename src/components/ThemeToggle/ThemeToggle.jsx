import "./ThemeToggle.css";

/**
 * Switches the page between light and dark.
 *
 * Both icons are always in the DOM and the pair slides, which lets the change
 * read as one movement rather than a swap. The button reports its state through
 * aria-pressed rather than by changing its label, so a screen reader is not told
 * a different thing every time it is used.
 */
export default function ThemeToggle({ theme, onToggle, className = "" }) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={`theme-toggle ${isLight ? "is-light" : ""} ${className}`}
      onClick={onToggle}
      aria-pressed={isLight}
      aria-label="Use the light theme"
      title={isLight ? "Switch to the dark theme" : "Switch to the light theme"}
    >
      <span className="theme-toggle__well" aria-hidden="true">
        <span className="theme-toggle__knob" />
        <span className="theme-toggle__icons">
          <svg viewBox="0 0 24 24" className="theme-toggle__icon">
            <circle
              cx="12"
              cy="12"
              r="4.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.6 5.4 17 7M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <svg viewBox="0 0 24 24" className="theme-toggle__icon">
            <path
              d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.6 8.6 0 1 0 9.4 9.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </button>
  );
}
