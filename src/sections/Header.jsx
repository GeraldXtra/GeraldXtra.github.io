import { useEffect, useState } from "react";
import Clock from "../components/Clock";
import Icon from "../components/Icon";
import Logo from "../components/Logo";
import { SECTIONS } from "../data/nav";
import useThemeMode from "../hooks/useThemeMode";

/* The hero is watched too, so scrolling back to the top clears the mark. */
const WATCHED = ["top", "about", "services", "skills", "work", "process", "contact"];

export default function Header({ navRef, menuBtnRef, menuOpen, onMenuToggle }) {
  const [mode, toggleTheme] = useThemeMode();
  const [current, setCurrent] = useState(null);

  /* Mark the section in view in the header. */
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          setCurrent(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    WATCHED.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className="nav" id="nav" ref={navRef}>
      <div className="wrap nav__inner">
        <a className="logo" href="#top" aria-label="Eberechukwu Gerald, home">
          <Logo />
        </a>
        <nav className="nav__nav" aria-label="Main">
          <ul className="nav__links">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={"#" + s.id} aria-current={current === s.id ? "location" : undefined}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__tools">
          <p className="clock">
            <span>Lagos time</span>
            <Clock />
          </p>
          <button
            className="icon-btn"
            id="theme"
            type="button"
            aria-label={mode === "dark" ? "Switch to the light theme" : "Switch to the dark theme"}
            data-mode={mode}
            onClick={toggleTheme}
          >
            <Icon name="sun" className="i i-sun" />
            <Icon name="moon" className="i i-moon" />
          </button>
          <a className="btn btn--ghost btn--small nav__hire" href="#contact">
            Hire me
          </a>
          <button
            className="icon-btn menu-btn"
            id="menu-btn"
            type="button"
            aria-expanded={String(menuOpen)}
            aria-controls="menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            ref={menuBtnRef}
            onClick={onMenuToggle}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}
