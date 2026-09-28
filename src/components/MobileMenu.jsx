import { useEffect, useRef } from "react";
import Clock from "./Clock";
import { SECTIONS } from "../data/nav";

export default function MobileMenu({ open, onClose, menuBtnRef }) {
  const menuRef = useRef(null);

  /* While open, the page behind stays put and focus moves to the first link.
     This runs after is-open is in the DOM, so the link is visible when it takes focus. */
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const first = menuRef.current && menuRef.current.querySelector("a");
    if (first) first.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Escape closes the menu and hands focus back to the button that opened it. */
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") {
        onClose();
        if (menuBtnRef.current) menuBtnRef.current.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, menuBtnRef]);

  return (
    <div className={"menu" + (open ? " is-open" : "")} id="menu" ref={menuRef}>
      {SECTIONS.map((s, i) => (
        <a key={s.id} href={"#" + s.id} style={{ "--i": i }} onClick={() => onClose()}>
          {s.label}
        </a>
      ))}
      <p className="menu__foot">
        It's <Clock /> in Lagos. I usually reply the same day.
      </p>
    </div>
  );
}
