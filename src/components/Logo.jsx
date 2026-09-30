/* The EUG. wordmark. The letters take the text colour and the full stop the accent,
   so it follows both themes wherever it sits. Decorative: the link or card around it
   carries the label. */
export default function Logo({ className = "logo__mark" }) {
  return (
    <svg className={className} viewBox="0 -10 332 122" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M66 11H11V89H66M11 50H56" />
        <path d="M100 11V59A30 30 0 0 0 130 89H136A30 30 0 0 0 166 59V11" />
        <path d="M262 11H230A30 30 0 0 0 200 41V59A30 30 0 0 0 230 89H242A30 30 0 0 0 272 59V50H238" />
      </g>
      <circle className="logo__ring" cx="309" cy="89" r="17.5" fill="none" stroke="var(--accent)" strokeWidth="3.5" opacity=".38" />
      <circle className="logo__dot" cx="309" cy="89" r="11" fill="var(--accent)" />
    </svg>
  );
}
