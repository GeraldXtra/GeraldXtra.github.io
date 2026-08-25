import "./ScrollProgress.css";

/**
 * A hairline across the very top of the window that fills as the page moves.
 *
 * It carries no props and never re renders. The fill is driven entirely by the
 * `--scroll-progress` custom property that usePageScroll writes onto the
 * document, so scrolling costs a style recalculation rather than a render.
 */
export default function ScrollProgress() {
  return (
    <div className="progress" aria-hidden="true">
      <span className="progress__fill" />
    </div>
  );
}
