import { useCallback, useEffect, useRef, useState } from "react";
import { navLinks, profile, socials } from "../../data/profile";
import useLockScroll from "../../hooks/useLockScroll";
import useMediaQuery from "../../hooks/useMediaQuery";
import scrollToId from "../../utils/scrollToId";
import Icon from "../common/Icon";
import Magnetic from "../common/Magnetic";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./Navbar.css";

export default function Navbar({ scrolled, activeId, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 981px)");
  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  const jumpTimer = useRef(0);

  useLockScroll(open);

  useEffect(() => () => window.clearTimeout(jumpTimer.current), []);

  // The overlay has no reason to exist once the layout is wide enough for the
  // full navigation row.
  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  /**
   * Closes the overlay and hands focus back to the control that opened it,
   * rather than dropping it on the body where the next Tab would restart from
   * the top of the document.
   */
  const closeMenu = useCallback(({ restoreFocus = true } = {}) => {
    setOpen(false);
    if (restoreFocus) burgerRef.current?.focus();
  }, []);

  /**
   * While the overlay is up it owns the keyboard. Escape closes it, and Tab is
   * wrapped back around so focus cannot wander off into the page sitting
   * hidden behind it.
   */
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const inside = menuRef.current?.querySelectorAll("a[href], button");
      if (!inside || !inside.length) return;

      // The header renders above the overlay, so the burger is still on screen
      // as the visible close control and has to be part of the cycle, or a
      // keyboard user can see the cross but never reach it.
      //
      // Order matters here: the burger lives in the header, which comes before
      // the overlay in the document. Listing it first makes the wrap match the
      // order the browser would move through anyway, so only the two ends need
      // intercepting.
      const stops = [burgerRef.current, ...inside].filter(Boolean);
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      const held = stops.includes(active);

      if (event.shiftKey && (active === first || !held)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !held)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Opening with the keyboard should land the visitor inside the panel.
    const entry = menuRef.current?.querySelector("a[href]");
    entry?.focus();

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  const go = useCallback(
    (event, href, fromMenu = false) => {
      if (!href.startsWith("#")) return;
      event.preventDefault();

      if (fromMenu && open) {
        // Focus goes to the section being visited, not back to the burger.
        closeMenu({ restoreFocus: false });
        // Let the overlay clear and the page unlock before moving.
        window.clearTimeout(jumpTimer.current);
        jumpTimer.current = window.setTimeout(() => scrollToId(href), 300);
        return;
      }

      scrollToId(href);
    },
    [open, closeMenu],
  );

  const desktopLinks = navLinks.filter((link) => link.desktop);

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <a
          href="#hero"
          className={`nav__mark ${activeId === "hero" ? "is-current" : ""}`}
          onClick={(event) => go(event, "#hero")}
          aria-label={`${profile.firstName}, back to the top`}
        >
          {profile.initials}
          <span className="nav__mark-dot">.</span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {desktopLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`nav__link ${activeId === link.id ? "is-active" : ""}`}
              onClick={(event) => go(event, link.href)}
              aria-current={activeId === link.id ? "true" : undefined}
            >
              <span className="nav__link-text" data-text={link.label}>
                {link.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <Magnetic strength={0.22} max={9}>
            <a
              href="#contact"
              className="nav__cta"
              onClick={(event) => go(event, "#contact")}
            >
              <span className="nav__cta-label">Hire me</span>
              <Icon name="arrowUpRight" size={15} />
            </a>
          </Magnetic>

          <button
            ref={burgerRef}
            type="button"
            className={`burger ${open ? "is-open" : ""}`}
            onClick={() => (open ? closeMenu() : setOpen(true))}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close the menu" : "Open the menu"}
          >
            <span className="burger__bar" />
            <span className="burger__bar" />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`menu ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <nav className="menu__links" aria-label="Sections">
          {navLinks.map((link, index) => (
            <a
              key={link.id}
              href={link.href}
              className={`menu__link ${activeId === link.id ? "is-active" : ""}`}
              style={{ "--menu-delay": `${140 + index * 55}ms` }}
              onClick={(event) => go(event, link.href, true)}
              tabIndex={open ? 0 : -1}
            >
              <span className="menu__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="menu__label">{link.label}</span>
              <Icon name="arrowUpRight" size={20} className="menu__arrow" />
            </a>
          ))}
        </nav>

        {/* No theme toggle down here on purpose. The one in the header stays
            visible at every width, and a second copy would put an identical
            control into the overlay's focus cycle. */}
        <div className="menu__foot">
          <span className="menu__foot-note">{profile.location}</span>
          <div className="menu__socials">
            {socials
              .filter((item) => item.id !== "email")
              .map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="menu__social"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  tabIndex={open ? 0 : -1}
                >
                  <Icon name={item.icon} size={17} />
                </a>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
