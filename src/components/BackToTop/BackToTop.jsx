import Icon from "../common/Icon";
import "./BackToTop.css";

/**
 * Appears once the visitor is far enough down for the trip back to be a chore.
 * The ring around it traces how much of the page has been read, driven by the
 * `--scroll-progress` custom property rather than by a prop, so scrolling never
 * re renders this component.
 */
export default function BackToTop({ visible }) {
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`to-top ${visible ? "is-visible" : ""}`}
      onClick={handleClick}
      aria-label="Back to the top of the page"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="to-top__ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="to-top__ring-track" cx="24" cy="24" r="21" />
        <circle className="to-top__ring-fill" cx="24" cy="24" r="21" />
      </svg>
      <Icon name="chevronUp" size={18} className="to-top__icon" />
    </button>
  );
}
