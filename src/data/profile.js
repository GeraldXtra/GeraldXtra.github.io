const START_YEAR = 2022;

export const yearsWorking = new Date().getFullYear() - START_YEAR;

const spelled = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export const yearsInWords = spelled[yearsWorking] ?? String(yearsWorking);

export const profile = {
  fullName: "Eberechukwu Uchechukwu Gerald",
  firstName: "Gerald",
  initials: "EUG",
  role: "Software Developer & UI/UX Designer",
  location: "Lagos, Nigeria",
  timeline: `${START_YEAR} to Present`,
  email: "geralddevbit@gmail.com",
  phone: "+234 712 010 3256",
  phoneRaw: "2347120103256",
  formEndpoint: "https://formspree.io/f/mdabpgpz",
};

export const hero = {
  status: "Available for remote work",
  titleLines: [
    { text: "Software Developer" },
    { lead: "&", accent: "UI/UX Designer" },
  ],
  typedPrefix: "Currently building",
  typedPhrases: [
    "interfaces people trust.",
    "sites that load fast.",
    "products worth shipping.",
    "layouts that hold their shape.",
    "systems a team can grow into.",
  ],
  intro: `Freelance developer and designer working out of Lagos. For ${yearsInWords} years I have been building websites and products for founders and small teams, handling the design and the code myself so nothing gets lost in the gap between them.`,
  primaryCta: { label: "See the work", href: "#work" },
  secondaryCta: { label: "Start a project", href: "#contact" },
  portraitBadge: "Open for work",
};

export const about = {
  eyebrow: "About me",
  title: ["The person", "behind the work"],
  paragraphs: [
    `I taught myself to build for the web, then spent the last ${yearsInWords} years freelancing for founders and small teams who needed one person who could take a rough idea through design and all the way into working code.`,
    "The way I work is not complicated. I sit with the problem until I genuinely understand it, sketch until the flow stops fighting me, then write code that someone else can pick up months later without wondering what I was thinking.",
    "Everything happens remotely and it works because I keep it boring: clear writing, short feedback loops, and progress shared often enough that nobody ever has to ask where a project stands.",
  ],
  stats: [
    { value: yearsWorking, suffix: "+", label: "Years freelancing" },
    { value: 10, suffix: "+", label: "Projects shipped" },
    { value: 100, suffix: "%", label: "Remote workflow" },
    { value: 24, suffix: "h", label: "Usual reply time" },
  ],
  card: {
    role: "Software Developer · UI/UX Designer",
    rows: [
      {
        icon: "pin",
        label: "Based in",
        value: "Lagos, Nigeria, working remotely",
      },
      {
        icon: "monitor",
        label: "Focus",
        value: "Full stack web development and interface design",
      },
      {
        icon: "clock",
        label: "Availability",
        value: "Open to freelance projects and remote roles",
      },
      {
        icon: "chat",
        label: "Reply time",
        value: "Usually the same day, never past 24 hours",
      },
    ],
  },
};

export const marqueeWords = [
  "Web Development",
  "Interface Design",
  "Design Systems",
  "Responsive Builds",
  "Figma to Code",
  "Remote Ready",
  "Lagos, Nigeria",
];

export const socials = [
  {
    id: "email",
    icon: "mail",
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    id: "whatsapp",
    icon: "whatsapp",
    label: "WhatsApp",
    value: profile.phone,
    href: `https://wa.me/${profile.phoneRaw}`,
  },
  {
    id: "github",
    icon: "github",
    label: "GitHub",
    value: "github.com/GeraldXtra",
    href: "https://github.com/GeraldXtra",
  },
  {
    id: "x",
    icon: "x",
    label: "X",
    value: "x.com/GeraldXtra",
    href: "https://x.com/GeraldXtra",
  },
  {
    id: "tiktok",
    icon: "tiktok",
    label: "TikTok",
    value: "tiktok.com/@geraldxtra",
    href: "https://www.tiktok.com/@geraldxtra",
  },
];

export const navLinks = [
  { id: "hero", label: "Home", href: "#hero", desktop: false },
  { id: "about", label: "About", href: "#about", desktop: true },
  { id: "services", label: "Services", href: "#services", desktop: true },
  { id: "skills", label: "Skills", href: "#skills", desktop: true },
  { id: "work", label: "Work", href: "#work", desktop: true },
  { id: "process", label: "Process", href: "#process", desktop: true },
  { id: "contact", label: "Contact", href: "#contact", desktop: true },
];
