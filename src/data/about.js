/* The About section: the timeline, the quick facts for screen readers, and the board rows. */

export const TIMELINE = [
  { year: "2022", text: "Started teaching myself to build for the web." },
  { year: "2024", text: "Started freelancing for founders and small teams." },
  { year: "Now", text: "Studying at Aptech in Ajao Estate, and building Tessa." },
];

export const FACTS = [
  "Based in Lagos, Nigeria, working remotely",
  "Focus: full stack web development and interface design",
  "Availability: open to freelance projects and remote roles",
  "Reply time: usually the same day, always within 24 hours",
];

/* The Lagos time row is filled from the clock; the Now row cycles through its values. */
export const BOARD_ROWS = [
  { label: "Lagos time", value: "", clockRow: true },
  { label: "Based in", value: "LAGOS, NIGERIA" },
  {
    label: "Now",
    value: "BUILDING TESSA",
    cycle: "BUILDING TESSA|APTECH STUDENT|TAKING NEW WORK",
    now: true,
  },
  { label: "Focus", value: "FULL STACK AND UI" },
  { label: "Open to", value: "FREELANCE, REMOTE" },
  { label: "Reply time", value: "SAME DAY" },
];
