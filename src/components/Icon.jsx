/* One icon from the sprite. The class and aria-hidden follow the markup at each use:
   most icons are <svg class="i" aria-hidden="true">, but icons inside an aria-hidden
   wrapper carry no aria-hidden of their own (hidden={false}). */
export default function Icon({ name, className = "i", hidden = true, viewBox }) {
  return (
    <svg className={className || undefined} aria-hidden={hidden ? "true" : undefined} viewBox={viewBox}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
