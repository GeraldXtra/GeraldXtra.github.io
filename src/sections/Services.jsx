import Icon from "../components/Icon";
import ServiceArt from "../components/ServiceArt";
import { SERVICES } from "../data/services";

export default function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="head">
          <h2 id="services-title" className="reveal-wipe">
            One person for the design and the code.
          </h2>
          <p className="lede reveal">
            Projects usually lose their time in the handover between the person who drew it and the person who built
            it. Here there isn't one.
          </p>
        </div>
        <div className="services">
          {SERVICES.map((s, i) => (
            <article key={s.kind} className={"service service--" + s.kind + " reveal"} data-spot="" style={{ "--i": i }}>
              <div className="service__text">
                <div className="service__head">
                  <span className="ico" aria-hidden="true">
                    <Icon name={s.icon} hidden={false} />
                  </span>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.text}</p>
                <ul className="points">
                  {s.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <ServiceArt kind={s.kind} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
