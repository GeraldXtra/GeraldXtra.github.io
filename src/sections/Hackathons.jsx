import Icon from "../components/Icon";
import { CERTIFICATE, HACKATHONS } from "../data/hackathons";

function Links({ links, onOpenCertificate, certificate }) {
  return (
    <div className="pinfo__links">
      {certificate ? (
        <button className="project__link link-btn" type="button" data-cert-open="" onClick={onOpenCertificate}>
          View certificate
        </button>
      ) : null}
      {links.map((l) => (
        <a key={l.href} className="project__link" href={l.href} target="_blank" rel="noopener noreferrer">
          {l.text}
          <span className="sr-only">, opens in a new tab</span>
        </a>
      ))}
    </div>
  );
}

export default function Hackathons({ onOpenCertificate }) {
  return (
    <section className="section" id="hackathons" aria-labelledby="hack-title">
      <div className="wrap">
        <div className="head">
          <h2 id="hack-title" className="reveal-wipe">
            Hackathons
          </h2>
          <p className="lede reveal">Two competitions this year, and what I built for each one.</p>
        </div>
        <div className="hacks">
          {HACKATHONS.map((h) => (
            <article key={h.key} className={h.certificate ? "hack reveal" : "hack hack--flip reveal"} data-spot="">
              {h.certificate ? (
                <button
                  className="hack__media hack__media--zoom"
                  type="button"
                  data-cert-open=""
                  aria-label={CERTIFICATE.zoomLabel}
                  onClick={onOpenCertificate}
                >
                  <img
                    id="cert-thumb"
                    src={CERTIFICATE.image}
                    width={CERTIFICATE.width}
                    height={CERTIFICATE.height}
                    alt={CERTIFICATE.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="hack__zoom" aria-hidden="true">
                    <Icon name="expand" hidden={false} />
                    View certificate
                  </span>
                </button>
              ) : (
                <a
                  className="hack__media"
                  href={h.media.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img src={h.media.image} width={h.media.width} height={h.media.height} alt="" loading="lazy" decoding="async" />
                </a>
              )}
              <div className="hack__body">
                <div className="hack__top">
                  <span className="ico" aria-hidden="true">
                    <Icon name={h.icon} hidden={false} />
                  </span>
                  <p className="hack__meta">
                    <b>{h.org}</b>
                    <span>{h.date}</span>
                  </p>
                </div>
                <h3>{h.title}</h3>
                <p className="hack__role">{h.role}</p>
                <p className="hack__text">{h.text}</p>
                <Links links={h.links} certificate={h.certificate} onOpenCertificate={onOpenCertificate} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
