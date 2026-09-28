import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import { EMAIL } from "../data/contact";

export default function ClosingCall() {
  const [label, setLabel] = useState("Copy email");
  const alive = useRef(false);
  const timers = useRef(new Set());

  useEffect(() => {
    const pending = timers.current;
    alive.current = true;
    return () => {
      alive.current = false;
      pending.forEach((t) => clearTimeout(t));
      pending.clear();
    };
  }, []);

  function copied(ok) {
    if (!alive.current) return;
    setLabel(ok ? "Copied" : "Couldn't copy");
    const t = setTimeout(() => {
      timers.current.delete(t);
      setLabel("Copy email");
    }, 2200);
    timers.current.add(t);
  }

  function fallbackCopy() {
    if (!alive.current) return;
    try {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      copied(ok);
    } catch {
      copied(false);
    }
  }

  function onCopy() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(() => copied(true), fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  return (
    <section className="cta" id="cta" aria-label="Email">
      <div className="wrap">
        <p className="cta__kicker">Have something in mind?</p>
        <div className="cta__row">
          <a className="cta__email reveal" href={"mailto:" + EMAIL}>
            {EMAIL}
          </a>
          <button className="btn btn--ghost btn--small" id="copy" type="button" onClick={onCopy}>
            <Icon name="copy" />
            <span>{label}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
