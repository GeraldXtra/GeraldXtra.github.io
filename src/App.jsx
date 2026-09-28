import { useEffect, useRef, useState } from "react";
import SvgSprite from "./components/SvgSprite";
import LagosMap from "./components/LagosMap";
import MobileMenu from "./components/MobileMenu";
import CertificateDialog from "./components/CertificateDialog";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Services from "./sections/Services";
import Skills from "./sections/Skills";
import Work from "./sections/Work";
import Hackathons from "./sections/Hackathons";
import Process from "./sections/Process";
import Contact from "./sections/Contact";
import ClosingCall from "./sections/ClosingCall";
import Footer from "./sections/Footer";
import { clamp, darkMQ, fineMQ, offMQ, onMQ, reduced } from "./utils/motion";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null); // the map's { restyle, setDim, veilMax, pulseAt } once its data has arrived
  const navRef = useRef(null);
  const veilRef = useRef(null);
  const menuBtnRef = useRef(null);
  const certRef = useRef(null);
  const scrollRef = useRef(null); // the current onScroll, so the map can run it once it is ready

  /* Solid header after scrolling, and the veil that lets the map fade behind the content.
     Both are written straight to the DOM, so scrolling never re-renders the page. */
  useEffect(() => {
    const nav = navRef.current;
    const veil = veilRef.current;
    const hero = document.getElementById("top");
    const cta = document.getElementById("cta");
    let scrollQueued = false;
    let raf = 0;
    function onScroll() {
      scrollQueued = false;
      raf = 0;
      const map = mapRef.current;
      const y = window.scrollY || window.pageYOffset || 0;
      const vh = window.innerHeight;
      const hh = hero.offsetHeight || vh;
      const v1 = clamp((y - hh * 0.2) / (hh * 0.55), 0, 1);
      const ctaTop = cta.getBoundingClientRect().top + y;
      const v2 = clamp((y + vh - ctaTop) / (vh * 0.75), 0, 1);
      const d = (map ? map.veilMax() : 0.85) * v1 * (1 - 0.6 * v2);
      veil.style.opacity = d.toFixed(3);
      if (map) map.setDim(d);
      nav.classList.toggle("is-solid", y > 12);
    }
    function queue() {
      if (!scrollQueued) {
        scrollQueued = true;
        raf = requestAnimationFrame(onScroll);
      }
    }
    /* The map redraws in the new theme's colours, then the veil picks up its new maximum. */
    function themeChanged() {
      if (mapRef.current) mapRef.current.restyle();
      onScroll();
    }
    scrollRef.current = onScroll;
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", onScroll);
    const mo = new MutationObserver(themeChanged);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    onMQ(darkMQ, themeChanged);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      offMQ(darkMQ, themeChanged);
      scrollRef.current = null;
    };
  }, []);

  /* Sections ease in once as they arrive. */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal, .reveal-wipe"));
    if (!("IntersectionObserver" in window) || reduced()) {
      els.forEach((e) => e.classList.add("is-in"));
      return undefined;
    }
    const rio = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            rio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    /* A heading that starts fully clipped never reports as visible, so its parent is watched instead. */
    const wipeParents = new Map();
    const wio = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          (wipeParents.get(e.target) || []).forEach((t) => t.classList.add("is-in"));
          wio.unobserve(e.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    els.forEach((e) => {
      if (!e.classList.contains("reveal-wipe")) {
        rio.observe(e);
        return;
      }
      const p = e.parentElement;
      if (!wipeParents.has(p)) {
        wipeParents.set(p, []);
        wio.observe(p);
      }
      wipeParents.get(p).push(e);
    });
    return () => {
      rio.disconnect();
      wio.disconnect();
    };
  }, []);

  /* Cards light up around the pointer. */
  useEffect(() => {
    if (!fineMQ.matches) return undefined;
    const cards = Array.from(document.querySelectorAll("[data-spot]"));
    const handlers = cards.map((el) => {
      const move = (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--sx", e.clientX - r.left + "px");
        el.style.setProperty("--sy", e.clientY - r.top + "px");
      };
      el.addEventListener("pointermove", move);
      return move;
    });
    return () => cards.forEach((el, i) => el.removeEventListener("pointermove", handlers[i]));
  }, []);

  return (
    <>
      <SvgSprite />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <LagosMap apiRef={mapRef} veilRef={veilRef} onReady={() => scrollRef.current && scrollRef.current()} />
      <Header
        navRef={navRef}
        menuBtnRef={menuBtnRef}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} menuBtnRef={menuBtnRef} />
      <main id="main" className="page">
        <Hero mapRef={mapRef} />
        <About />
        <Services />
        <Skills />
        <Work />
        <Hackathons onOpenCertificate={() => certRef.current && certRef.current.open()} />
        <Process />
        <Contact />
        <ClosingCall />
      </main>
      <Footer />
      <CertificateDialog ref={certRef} />
    </>
  );
}
