import { services } from "../../data/services";
import useMediaQuery from "../../hooks/useMediaQuery";
import usePointerTilt from "../../hooks/usePointerTilt";
import useReducedMotion from "../../hooks/useReducedMotion";
import Icon from "../common/Icon";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import "./Services.css";

function ServiceCard({ item, delay }) {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const tilt = usePointerTilt({ max: 3, enabled: finePointer && !reduced });

  return (
    <Reveal
      as="article"
      variant="up"
      delay={delay}
      shift={30}
      className="service"
    >
      <div
        className="service__inner"
        ref={tilt.ref}
        onMouseMove={tilt.onPointerMove}
        onMouseLeave={tilt.onPointerLeave}
      >
        <span className="service__glow" aria-hidden="true" />
        <span className="service__seam" aria-hidden="true" />

        <header className="service__head">
          <span className="service__icon" aria-hidden="true">
            <Icon name={item.icon} size={21} />
          </span>
          <span className="service__index" aria-hidden="true">
            {item.index}
          </span>
        </header>

        <h3 className="service__title">{item.title}</h3>
        <p className="service__body">{item.body}</p>

        <ul className="service__points">
          {item.points.map((point) => (
            <li className="service__point" key={point}>
              <span className="service__bullet" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Services() {
  return (
    <section id="services" className="section section--dark services">
      <div className="shell">
        <SectionHeading
          eyebrow={services.eyebrow}
          eyebrowTone="clay"
          title={[
            services.title[0],
            { text: services.title[1], accent: "one person to brief" },
          ]}
          lede={services.lede}
        />

        <div className="services__grid">
          {services.items.map((item, index) => (
            <ServiceCard key={item.id} item={item} delay={index * 110} />
          ))}
        </div>
      </div>
    </section>
  );
}
