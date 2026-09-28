/* The four services, in page order. kind picks the card modifier and its moving scene. */
export const SERVICES = [
  {
    kind: "web",
    icon: "code",
    title: "Web development",
    text: "Marketing sites, dashboards and web apps, built from an empty folder. Proper markup, keyboard support that actually works, and a front end that still behaves on a cheap phone.",
    points: ["React and Vite", "Responsive layouts", "Clean, readable code"],
  },
  {
    kind: "pen",
    icon: "pen",
    title: "Interface design",
    text: "Wireframes through to finished screens in Figma. Type, spacing and colour picked on purpose, then handed over as a file a developer can build from without guessing.",
    points: ["Figma workflow", "Prototypes", "Developer ready files"],
  },
  {
    kind: "tokens",
    icon: "grid",
    title: "Design systems",
    text: "Components, tokens and the rules around them, written down once. The tenth screen still looks like the first, and nobody has to argue about spacing again.",
    points: ["Component libraries", "Design tokens", "Usage guidelines"],
  },
  {
    kind: "rebuild",
    icon: "refresh",
    title: "Rebuilds and rescues",
    text: "Sites that grew sideways, got slow, or stopped looking like the brand. I read what's already there, keep what's worth keeping, and rebuild the rest properly.",
    points: ["Performance work", "Refactors", "Visual refresh"],
  },
];
