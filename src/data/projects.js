import safenote from "../assets/images/safenote.png";
import glovo from "../assets/images/glovo.png";
import resume from "../assets/images/resume.png";
import digitaz from "../assets/images/digitaz.png";
import etrade from "../assets/images/etrade.png";
import gearzone from "../assets/images/gearzone.png";
import crunchyroll from "../assets/images/crunchyroll.png";
import ledgerwatch from "../assets/images/ledgerwatch.png";

export const projectFilters = [
  { id: "all", label: "Everything" },
  { id: "web", label: "Web Development" },
  { id: "uiux", label: "UI/UX Design" },
];

export const projects = [
  {
    id: "safenote",
    index: "01",
    type: "web",
    tagLabel: "Web Dev",
    title: "SafeNote",
    image: safenote,
    alt: "The SafeNote landing page showing the note composer",
    description:
      "A place to send a note or a file that erases itself. Everything is encrypted in the browser before it leaves, the link opens exactly once, and nobody has to create an account to use it.",
    stack: ["React", "Node.js", "Encryption"],
    url: "https://safenote.xyz",
  },
  {
    id: "glovo",
    index: "02",
    type: "web",
    tagLabel: "Web Dev",
    title: "Glovo Front End Clone",
    image: glovo,
    alt: "A rebuild of the Glovo delivery homepage",
    description:
      "A close rebuild of the Glovo delivery front end, written from scratch in plain HTML and CSS. Clipped section edges, a header that sticks properly, and a layout that survives every breakpoint I threw at it.",
    stack: ["HTML", "CSS", "Clip Path", "Responsive"],
    url: null,
  },
  {
    id: "resume",
    index: "03",
    type: "web",
    tagLabel: "Web Dev",
    title: "Resume Template",
    image: resume,
    alt: "A two column resume laid out as a web page",
    description:
      "A resume built as a real web page and set up to print cleanly on one sheet. Two columns, sidebar skill meters, and a typographic system built around Cormorant Garamond.",
    stack: ["HTML", "CSS", "Print Design", "Typography"],
    url: "https://gerald-resume.netlify.app",
  },
  {
    id: "digitaz",
    index: "04",
    type: "web",
    tagLabel: "Web Dev",
    title: "Digitaz Storefront",
    image: digitaz,
    alt: "The Digitaz gaming storefront homepage",
    description:
      "A storefront aimed at gamers. Product grids, category browsing and a checkout flow, all built on the front end and tuned to make a long catalogue feel quick to move through.",
    stack: ["HTML", "CSS", "JavaScript"],
    url: null,
  },
  {
    id: "etrade",
    index: "05",
    type: "web",
    tagLabel: "Web Dev",
    title: "e Trade Storefront",
    image: etrade,
    alt: "The e Trade gadget shop homepage",
    description:
      "A shop for phones, accessories and small gadgets. The brief was simple: make a big catalogue feel small, and keep the path from browsing to buying as short as it can reasonably be.",
    stack: ["HTML", "CSS", "JavaScript"],
    url: null,
  },
  {
    id: "gearzone",
    index: "06",
    type: "uiux",
    tagLabel: "UI/UX",
    title: "Gearzone Commerce Design",
    image: gearzone,
    alt: "Gearzone interface screens designed in Figma",
    description:
      "The full design pass for Gearzone, a tech and gadget store. User flows, wireframes, a component library and the finished high fidelity screens, all built out in Figma.",
    stack: ["Figma", "Wireframing", "Prototyping", "Design System"],
    url: "https://www.figma.com/design/1bJ0oqAJ6EfqJF13e1CoRu/GearZone---Gaming-Tools-Ecommerce?node-id=0-1&t=qdBwVtZMyWsUGUk4-1",
  },
  {
    id: "crunchyroll",
    index: "07",
    type: "uiux",
    tagLabel: "UI/UX",
    title: "Crunchyroll Prototype",
    image: crunchyroll,
    alt: "Crunchyroll redesign screens and prototype flow",
    description:
      "A redesign and clickable prototype for Crunchyroll. Browsing a catalogue, starting an episode and picking up where you left off, mapped out screen by screen and wired together end to end.",
    stack: ["Figma", "Wireframing", "Prototyping", "Design System"],
    url: "https://www.figma.com/design/Wl7ct6gVZJZQ2FgIUOhxUZ/Crunchyroll-Project?node-id=0-1&t=IBF1bs7inPSB2hms-1",
  },
  {
    id: "ledgerwatch",
    index: "08",
    type: "web",
    tagLabel: "Web Dev",
    image: ledgerwatch,
    alt: "Ledger Watch landing page.",
    description:
      "LedgerWatch chases every outstanding invoice for you and monitors the market around the clock, so nothing slips while you run the business.",
    stack: ["React.js", "Web3.js", "Node.js", "MongoDB"],
    url: "https://www.useledgerwatch.co",
  },
];

export const work = {
  eyebrow: "Selected work",
  title: ["Things I have", "built and designed"],
  lede: "A short list rather than everything. These are the projects that best show how I think.",
};
