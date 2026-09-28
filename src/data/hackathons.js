import certificate from "../assets/hackathons/micro1-certificate.webp";
import freshfindCard from "../assets/hackathons/freshfind-card.webp";

/* The micro1 certificate: its thumbnail opens the full image in a dialog. */
export const CERTIFICATE = {
  image: certificate,
  width: 1280,
  height: 835,
  alt: "Certificate of Participation from micro1 for the Frontier Engineering Challenge 2026, presented to Uchechukwu Eberechukwu on September 10, 2026",
  zoomLabel: "View the micro1 certificate full size",
  dialogTitle: "micro1 Frontier Engineering Challenge 2026, certificate of participation",
};

export const HACKATHONS = [
  {
    key: "micro1",
    icon: "award",
    org: "micro1",
    date: "September 2026",
    title: "Frontier Engineering Challenge",
    role: "Certificate of participation",
    text: "My entry was Argus, an agent that reads a Solidity contract and reports known vulnerabilities with the file, line and severity. I tested it against a plain prompt baseline on ten publicly documented cases.",
    certificate: true,
    links: [{ href: "https://github.com/GeraldXtra/argus", text: "Argus on GitHub" }],
  },
  {
    key: "techwiz",
    icon: "users",
    org: "Aptech",
    date: "September 2026",
    title: "TechWiz 7",
    role: "Team leader, Tech Hive",
    text: "Aptech's world tech championship. I led a team of four, and under the eGreen Basket theme we built FreshFind, a guide to farmers markets in Lagos that runs entirely in the browser.",
    media: { href: "https://geraldxtra.github.io/freshfind/", image: freshfindCard, width: 960, height: 626 },
    links: [
      { href: "https://geraldxtra.github.io/freshfind/", text: "Open FreshFind" },
      { href: "https://github.com/GeraldXtra/freshfind", text: "FreshFind on GitHub" },
    ],
  },
];
