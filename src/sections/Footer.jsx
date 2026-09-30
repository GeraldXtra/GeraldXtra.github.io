import Icon from "../components/Icon";
import Logo from "../components/Logo";
import { SOCIAL } from "../data/contact";
import { SECTIONS } from "../data/nav";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="logo" href="#top" aria-label="Back to the top">
              <Logo />
            </a>
            <p>Web & App Developer & UI/UX Designer, building from Lagos, Nigeria.</p>
          </div>
          <nav className="footer__col" aria-label="Footer">
            <p className="mini-title">Sections</p>
            <ul>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={"#" + s.id}>{s.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="footer__col">
            <p className="mini-title">Elsewhere</p>
            <div className="social">
              {SOCIAL.map((s) => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <Icon name={s.icon} className="i i--fill" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer__base">
          <p>
            © <span data-year="">{new Date().getFullYear()}</span> Eberechukwu Uchechukwu Gerald. All rights reserved.
          </p>
          <p>Road, rail and water data © OpenStreetMap contributors</p>
          <a className="icon-btn" href="#top" aria-label="Back to the top">
            <Icon name="up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
