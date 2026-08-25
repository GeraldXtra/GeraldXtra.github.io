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
      "Send a note or a file that deletes itself after one read. Everything is encrypted in the browser before it leaves, the link opens once, and there's no account to create.",
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
      "A close rebuild of the Glovo delivery front end, written from scratch in plain HTML and CSS. Angled section edges, a header that sticks properly, and a layout that held up at every width I tried.",
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
      "A resume built as a real web page that still prints cleanly onto one sheet. Two columns, skill meters down the side, and a type system built around Cormorant Garamond.",
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
      "A storefront for gamers. Product grids, category browsing and a checkout flow, all on the front end, tuned so a long catalogue still feels quick to move through.",
    stack: ["HTML", "CSS", "JavaScript"],
    url: null,
  },
  {
    id: "etrade",
    index: "05",
    type: "web",
    tagLabel: "Web Dev",
    title: "eTrade Storefront",
    image: etrade,
    alt: "The eTrade gadget shop homepage",
    description:
      "A shop for phones, accessories and small gadgets. The brief was simple: make a big catalogue feel small, and keep the walk from browsing to buying short.",
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
      "The full design pass for Gearzone, a tech and gadget store. User flows, wireframes, a component library and the finished screens, all built out in Figma.",
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
      "A redesign and clickable prototype for Crunchyroll. Browsing the catalogue, starting an episode, and picking up where you left off, mapped out screen by screen and wired together.",
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
  title: ["Some things I've", "built and designed"],
  lede: "Not everything, just the ones worth showing. These say the most about how I work.",
};
