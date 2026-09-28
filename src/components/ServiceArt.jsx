import { useRef } from "react";
import usePlay from "../hooks/usePlay";

/* A page building itself. */
function WebScene() {
  return (
    <>
      <div className="mini">
        <div className="mini__bar">
          <i></i>
          <b></b>
        </div>
        <div className="mini__body">
          <b className="m m-nav" style={{ "--i": 0 }}></b>
          <div className="m-hero">
            <div className="m-text">
              <b className="m m-h1" style={{ "--i": 1 }}></b>
              <b className="m m-h1b" style={{ "--i": 2 }}></b>
              <b className="m m-p" style={{ "--i": 3 }}></b>
              <b className="m m-p2" style={{ "--i": 4 }}></b>
              <b className="m m-btn" style={{ "--i": 5 }}></b>
            </div>
            <b className="m m-img" style={{ "--i": 6 }}>
              <i></i>
            </b>
          </div>
          <div className="m-cards">
            <b className="m m-card" style={{ "--i": 7 }}></b>
            <b className="m m-card" style={{ "--i": 8 }}></b>
            <b className="m m-card" style={{ "--i": 9 }}></b>
          </div>
        </div>
      </div>
      <span className="mini__cursor">
        <svg viewBox="0 0 14 16">
          <use href="#i-cursor" />
        </svg>
      </span>
    </>
  );
}

/* The pen tool drawing a curve, kept as SVG with SMIL animation. */
function PenScene() {
  return (
    <svg className="smil" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
      <path className="pen-grid" d="M40 0V180M80 0V180M120 0V180M160 0V180M200 0V180M240 0V180M280 0V180M0 40H320M0 80H320M0 120H320M0 160H320" />
      <g opacity="0">
        <line className="pen-handle" x1="30" y1="138" x2="86" y2="30" />
        <circle className="pen-knob" cx="86" cy="30" r="3.5" />
        <line className="pen-handle" x1="168" y1="26" x2="224" y2="158" />
        <circle className="pen-knob" cx="168" cy="26" r="3.5" />
        <circle className="pen-knob" cx="224" cy="158" r="3.5" />
        <line className="pen-handle" x1="296" y1="48" x2="272" y2="158" />
        <circle className="pen-knob" cx="272" cy="158" r="3.5" />
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.5;0.56;0.86;0.94;1" dur="7s" repeatCount="indefinite" />
      </g>
      <path
        id="pen-curve"
        className="pen-curve"
        d="M30 138C86 30 168 26 196 92S272 158 296 48"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
      >
        <animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;0.06;0.5;1" dur="7s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.86;0.94;1" dur="7s" repeatCount="indefinite" />
      </path>
      <rect className="pen-pt" x="26.5" y="134.5" width="7" height="7" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.05;0.07;0.86;0.94;1" dur="7s" repeatCount="indefinite" />
      </rect>
      <rect className="pen-pt" x="192.5" y="88.5" width="7" height="7" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.3;0.32;0.86;0.94;1" dur="7s" repeatCount="indefinite" />
      </rect>
      <rect className="pen-pt" x="292.5" y="44.5" width="7" height="7" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.49;0.51;0.86;0.94;1" dur="7s" repeatCount="indefinite" />
      </rect>
      <g className="pen-nib" opacity="0">
        <path d="M0 0L-6 -12L-3.5 -24H3.5L6 -12Z" />
        <animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.06;0.5;1" calcMode="linear">
          <mpath href="#pen-curve" />
        </animateMotion>
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.06;0.52;0.6;1" dur="7s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

/* A spacing scale, colour swatches and a type ramp. */
function TokensScene() {
  return (
    <>
      <div className="tk-scale">
        <span style={{ "--i": 0, "--w": "10%" }}>
          <em>4</em>
          <b></b>
        </span>
        <span style={{ "--i": 1, "--w": "18%" }}>
          <em>8</em>
          <b></b>
        </span>
        <span style={{ "--i": 2, "--w": "28%" }}>
          <em>12</em>
          <b></b>
        </span>
        <span style={{ "--i": 3, "--w": "38%" }}>
          <em>16</em>
          <b></b>
        </span>
        <span style={{ "--i": 4, "--w": "56%" }}>
          <em>24</em>
          <b></b>
        </span>
        <span style={{ "--i": 5, "--w": "76%" }}>
          <em>32</em>
          <b></b>
        </span>
      </div>
      <div className="tk-side">
        <div className="tk-sw">
          <i style={{ "--i": 0, "--c": "var(--bg)" }}></i>
          <i style={{ "--i": 1, "--c": "var(--surface-2)" }}></i>
          <i style={{ "--i": 2, "--c": "var(--ink)" }}></i>
          <i style={{ "--i": 3, "--c": "var(--accent-fill)" }}></i>
        </div>
        <div className="tk-type">
          <b style={{ "--i": 0, fontSize: "32px" }}>Aa</b>
          <b style={{ "--i": 1, fontSize: "23px" }}>Aa</b>
          <b style={{ "--i": 2, fontSize: "16px" }}>Aa</b>
        </div>
      </div>
    </>
  );
}

/* A messy layout snapping into place. */
function RebuildScene() {
  return (
    <>
      <span className="rb-tag">
        <span>Before</span>
        <span>After</span>
      </span>
      <div className="rb">
        <b style={{ "--mx": "-26px", "--my": "14px", "--mr": "-6deg" }}></b>
        <b style={{ "--mx": "30px", "--my": "-10px", "--mr": "7deg" }}></b>
        <b style={{ "--mx": "-14px", "--my": "22px", "--mr": "11deg" }}></b>
        <b style={{ "--mx": "18px", "--my": "18px", "--mr": "-5deg" }}></b>
        <b style={{ "--mx": "-30px", "--my": "-6px", "--mr": "8deg" }}></b>
        <b style={{ "--mx": "12px", "--my": "-20px", "--mr": "-9deg" }}></b>
        <b style={{ "--mx": "26px", "--my": "10px", "--mr": "4deg" }}></b>
      </div>
    </>
  );
}

const SCENES = { web: WebScene, pen: PenScene, tokens: TokensScene, rebuild: RebuildScene };

export default function ServiceArt({ kind }) {
  const ref = useRef(null);
  usePlay(ref);
  const Scene = SCENES[kind];
  return (
    <div className={"art art--" + kind} data-play="" aria-hidden="true" ref={ref}>
      <Scene />
    </div>
  );
}
