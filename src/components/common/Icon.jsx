/**
 * Every icon on the page lives here as inline markup.
 *
 * Drawing them locally rather than pulling an icon font off a CDN removes a
 * render blocking request, keeps the stroke weight consistent with the rest of
 * the type, and means the icons inherit colour like any other text.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const brand = { fill: "currentColor", stroke: "none" };

const shapes = {
  pin: (
    <g {...stroke}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </g>
  ),
  monitor: (
    <g {...stroke}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
    </g>
  ),
  clock: (
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2V12l3.2 2" />
    </g>
  ),
  chat: (
    <g {...stroke}>
      <path d="M20.5 12.2c0 3.9-3.8 7-8.5 7a9.7 9.7 0 0 1-2.7-.38L4 20.5l1.35-3.7A6.6 6.6 0 0 1 3.5 12.2c0-3.87 3.8-7 8.5-7s8.5 3.13 8.5 7Z" />
    </g>
  ),
  mail: (
    <g {...stroke}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </g>
  ),
  code: (
    <g {...stroke}>
      <path d="m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13.6 5.5l-3.2 13" />
    </g>
  ),
  pen: (
    <g {...stroke}>
      <path d="M4 20.2h3.6L19 8.8a2.55 2.55 0 0 0-3.6-3.6L4 16.6v3.6Z" />
      <path d="m14.4 6.4 3.2 3.2" />
    </g>
  ),
  grid: (
    <g {...stroke}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
    </g>
  ),
  refresh: (
    <g {...stroke}>
      <path d="M20.2 11.2a8.2 8.2 0 0 0-14.1-4.5L3.5 9.2" />
      <path d="M3.8 12.8a8.2 8.2 0 0 0 14.1 4.5l2.6-2.5" />
      <path d="M3.5 4.6v4.6h4.6M20.5 19.4v-4.6h-4.6" />
    </g>
  ),
  arrowRight: (
    <g {...stroke}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </g>
  ),
  arrowUpRight: (
    <g {...stroke}>
      <path d="M7 17 17 7M8.6 7H17v8.4" />
    </g>
  ),
  chevronUp: (
    <g {...stroke}>
      <path d="m6 14.5 6-6 6 6" />
    </g>
  ),
  send: (
    <g {...stroke}>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
    </g>
  ),
  check: (
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.7 2.7L16 9.7" />
    </g>
  ),
  alert: (
    <g {...stroke}>
      <path d="M12 4.2 21 19.5H3L12 4.2Z" />
      <path d="M12 10v4M12 16.8h.01" />
    </g>
  ),
  loader: (
    <g {...stroke}>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </g>
  ),
  download: (
    <g {...stroke}>
      <path d="M12 3.5v11.2M7.8 10.5l4.2 4.2 4.2-4.2" />
      <path d="M4.5 16.5v2.2a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8v-2.2" />
    </g>
  ),
  lock: (
    <g {...stroke}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </g>
  ),
  github: (
    <path
      {...brand}
      d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3Z"
    />
  ),
  x: (
    <path
      {...brand}
      d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.25 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4Z"
    />
  ),
  tiktok: (
    <path
      {...brand}
      d="M16.6 0c.32 2.4 1.7 3.9 4.05 4.06v2.72c-1.37.13-2.57-.31-3.96-1.15v5.1c0 6.48-7.07 8.5-9.91 3.86-1.83-2.99-.7-8.24 5.16-8.45v2.87c-.45.07-.93.19-1.36.34-1.3.44-2.04 1.27-1.84 2.73.4 2.79 5.51 3.62 5.08-1.83V0h2.78Z"
    />
  ),
  whatsapp: (
    <path
      {...brand}
      d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.23-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.58-.34m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26 9.88 9.88 0 0 1 16.88-6.99 9.83 9.83 0 0 1 2.9 6.99 9.89 9.89 0 0 1-9.89 9.89M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.44c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.49-8.41"
    />
  ),
};

export default function Icon({ name, size = 20, className = "", ...rest }) {
  const shape = shapes[name];
  if (!shape) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shape}
    </svg>
  );
}
