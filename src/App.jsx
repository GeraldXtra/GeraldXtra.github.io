import { useCallback, useState } from "react";
import About from "./components/About/About";
import BackToTop from "./components/BackToTop/BackToTop";
import Contact from "./components/Contact/Contact";
import Cursor from "./components/Cursor/Cursor";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import Marquee from "./components/Marquee/Marquee";
import Navbar from "./components/Navbar/Navbar";
import Preloader from "./components/Preloader/Preloader";
import Process from "./components/Process/Process";
import Projects from "./components/Projects/Projects";
import ScrollProgress from "./components/ScrollProgress/ScrollProgress";
import Services from "./components/Services/Services";
import Skills from "./components/Skills/Skills";
import useLockScroll from "./hooks/useLockScroll";
import usePageScroll from "./hooks/usePageScroll";
import useScrollSpy from "./hooks/useScrollSpy";

const SECTION_IDS = [
  "hero",
  "about",
  "services",
  "skills",
  "work",
  "process",
  "contact",
];

export default function App() {
  // `ready` starts the hero moving the instant the count finishes.
  // `covered` keeps the panels mounted until they have slid clear.
  const [ready, setReady] = useState(false);
  const [covered, setCovered] = useState(true);

  // Only the two booleans come back as state. How far down the page the
  // visitor is rides on a CSS custom property instead, so scrolling does not
  // re render this tree. See usePageScroll.
  const { scrolled, deep } = usePageScroll();
  const activeId = useScrollSpy(SECTION_IDS);

  // The curtain hides the page rather than blocking it, so without this a flick
  // of the wheel during those three seconds would land the visitor halfway down
  // the page by the time the panels part.
  useLockScroll(covered);

  const handleReveal = useCallback(() => setReady(true), []);
  const handleFinished = useCallback(() => setCovered(false), []);

  return (
    <>
      {covered ? (
        <>
          <Preloader onReveal={handleReveal} onFinished={handleFinished} />
          <p className="sr-only" role="status">
            Loading the portfolio
          </p>
        </>
      ) : null}

      <span className="grain" aria-hidden="true" />
      <Cursor />
      <ScrollProgress />

      <a className="skip-link" href="#main">
        Skip to the content
      </a>

      <Navbar scrolled={scrolled} activeId={activeId} />

      {/* tabIndex lets the skip link place real focus here. Without it Firefox
          and Safari scroll to the landmark but leave focus on the link, so the
          next Tab restarts from the top of the page. */}
      <main id="main" tabIndex={-1}>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Services />
        <Skills />
        <Projects />
        <Process />
        <Contact />
      </main>

      <Footer />
      <BackToTop visible={deep} />
    </>
  );
}
