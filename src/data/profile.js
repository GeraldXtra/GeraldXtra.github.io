const START_YEAR = 2022;
const WORKING_YEAR = 2024;

export const yearsWorking = new Date().getFullYear() - WORKING_YEAR;
// export const learningYears = yearsWorking - START_YEAR;

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

  /* ------------------------------------------------------------------
     RESUME

     Drop your PDF in at  public/resume.pdf  and this starts working. The
     file in there now is a placeholder so the button has something to
     point at; overwrite it, keep the name, and nothing else needs editing.

     `resumeName` is what the browser saves the file as, so give it your
     own name rather than "resume.pdf" sitting in someone's downloads.
     ------------------------------------------------------------------ */
  resumeUrl: "/resume.pdf" || "Eberechukwu-Gerald-Resume.pdf",
  resumeName: "Eberechukwu-Gerald-Resume.pdf",
};

export const hero = {
  status: "Available for remote work",
  titleLines: [
    { text: "Software Developer" },
    { lead: "&", accent: "UI/UX Designer" },
  ],
  typedPrefix: "Currently building",
  typedPhrases: [
    "websites that load fast.",
    "interfaces people actually use.",
    "layouts that don't break.",
    "code the next person can read.",
    "work I'm happy to sign.",
  ],
  intro: `I'm a freelance developer and designer based in Lagos. For ${yearsInWords} years I've been building websites and products for founders and small teams, doing the design and the code myself so nothing falls through the gap between them.`,
  primaryCta: { label: "See the work", href: "#work" },
  secondaryCta: { label: "Start a project", href: "#contact" },
  portraitBadge: "Open for work",
};

export const about = {
  eyebrow: "About me",
  title: ["The person", "behind the work"],
  paragraphs: [
    `I spent two years teaching myself to build for the web, starting in ${START_YEAR}, and I'm currently furthering my tech education at Aptech in Ajao Estate, Lagos. The two years since have gone into freelancing for founders and small teams who needed one person to take a rough idea through design and all the way into working code.`,
    "How I work isn't complicated. I sit with the problem until I actually understand it, sketch until the flow stops fighting me, then write code someone else can pick up months later without wondering what I was thinking.",
    "All of it happens remotely, and it works because I keep it boring. I write things down, I reply quickly, and I show progress often enough that you never have to ask how it's going.",
    "Recently I built Tessa, a Windows AI assistant that takes the friction out of everyday work on the machine, coding included. It watches your downloads too, flags anything malicious before you open it, and tells you why.",
    "Alongside it I built a console that pulls Command Prompt, PowerShell and Git Bash into one window. It talks to Tessa directly, so you can hand a task over in plain language without leaving the terminal.",
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
        value: "Usually the same day, always within 24 hours",
      },
    ],
  },
};

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
