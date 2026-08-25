import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./Preloader.css";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Counts the page in, then splits apart to hand over to the hero.
 *
 * Three phases: `count` while the number climbs, `leave` while the two panels
 * slide off the top and bottom edges, then it removes itself. The parent is
 * told the moment the count finishes so the hero can start moving underneath
 * rather than waiting for the panels to clear.
 */
export default function Preloader({ onReveal, onFinished }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState("count");
  const reduced = useReducedMotion();
  const revealed = useRef(false);
  const finished = useRef(false);

  const duration = reduced ? 420 : 1750;
  const holdAfterCount = reduced ? 80 : 260;
  const panelTravel = reduced ? 120 : 1000;

  useEffect(() => {
    let frame = 0;
    let started = 0;
    let holdTimer = 0;
    let leaveTimer = 0;

    const finish = () => {
      if (!revealed.current) {
        revealed.current = true;
        onReveal?.();
      }
      setPhase("leave");
      leaveTimer = window.setTimeout(() => {
        if (finished.current) return;
        finished.current = true;
        onFinished?.();
      }, panelTravel);
    };

    const tick = (now) => {
      if (!started) started = now;
      const progress = Math.min(1, (now - started) / duration);
      setCount(Math.round(easeOutCubic(progress) * 100));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      holdTimer = window.setTimeout(finish, holdAfterCount);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(holdTimer);
      window.clearTimeout(leaveTimer);
    };
  }, [duration, holdAfterCount, panelTravel, onReveal, onFinished]);

  return (
    // The counter changes on every frame, so none of this is announced. A
    // polite live region wrapped around it would read out a hundred numbers in
    // a row. One quiet sentence says the same thing properly.
    <div className={`preloader preloader--${phase}`} aria-hidden="true">
      <span className="preloader__panel preloader__panel--top" />
      <span className="preloader__panel preloader__panel--bottom" />

      <div className="preloader__stage">
        <div className="preloader__mark">
          {profile.initials}
          <span className="preloader__dot">.</span>
        </div>

        <div className="preloader__meta">
          <span className="preloader__label">{profile.role}</span>
          <span className="preloader__count">
            {String(count).padStart(3, "0")}
          </span>
        </div>

        <div className="preloader__track">
          <span
            className="preloader__fill"
            style={{ transform: `scaleX(${count / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}
