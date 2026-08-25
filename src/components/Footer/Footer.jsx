import { navLinks, profile, socials } from "../../data/profile";
import scrollToId from "../../utils/scrollToId";
import Icon from "../common/Icon";
import Reveal from "../common/Reveal";
import "./Footer.css";

const YEAR = new Date().getFullYear();

export default function Footer() {
  const go = (event, href) => {
    event.preventDefault();
    scrollToId(href);
  };

  const quickLinks = navLinks.filter((link) => link.desktop);

  return (
    <footer className="footer">
      <div className="shell">
        <Reveal variant="up" className="footer__banner">
          <p className="footer__kicker">Have something in mind?</p>
          <a
            className="footer__call"
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.firstName} at ${profile.email}`}
          >
            <span className="footer__call-text">{profile.email}</span>
            <span className="footer__call-icon" aria-hidden="true">
              <Icon name="arrowUpRight" size={22} />
            </span>
          </a>
        </Reveal>

        <hr className="hairline footer__seam" />

        <div className="footer__body">
          <div className="footer__brand">
            <a
              className="footer__mark"
              href="#hero"
              onClick={(event) => go(event, "#hero")}
            >
              {profile.initials}
              <span className="footer__mark-dot">.</span>
            </a>
            <p className="footer__blurb">
              {profile.role} building for the web from {profile.location}.
            </p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <p className="footer__nav-title">Sections</p>
            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="footer__link"
                    onClick={(event) => go(event, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__social">
            <p className="footer__nav-title">Elsewhere</p>
            <div className="footer__icons">
              {socials
                .filter((item) => item.id !== "email")
                .map((item) => (
                  <a
                    key={item.id}
                    className="footer__icon"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={item.label}
                  >
                    <Icon name={item.icon} size={17} />
                  </a>
                ))}
            </div>
          </div>
        </div>

        <div className="footer__base">
          <p className="footer__copy">
            © {YEAR} {profile.fullName}. All rights reserved.
          </p>
          <p className="footer__built">
            Designed and built by me, with React and Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
