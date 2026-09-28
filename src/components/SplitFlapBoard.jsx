import { useEffect, useRef } from "react";
import { BOARD_ROWS, FACTS } from "../data/about";
import { reduced, whenVisible } from "../utils/motion";
import { lagosTime } from "../utils/time";

const ALPHA = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:,./";
const N = 17;
const FLAPS = Array.from({ length: N }, (_, i) => i);

function pad(t) {
  t = String(t).toUpperCase();
  if (t.length > N) t = t.slice(0, N);
  while (t.length < N) t += " ";
  return t;
}

/* Split flap board: every letter flips into place like an airport departures board.
   React renders the empty flaps once; from then on only the effect writes their letters. */
export default function SplitFlapBoard() {
  const boardRef = useRef(null);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return undefined;
    const pending = new Set();
    function later(fn, ms) {
      const id = setTimeout(() => {
        pending.delete(id);
        fn();
      }, ms);
      pending.add(id);
    }

    const strips = Array.from(el.querySelectorAll(".board__cells"));
    const rows = strips.map((strip) =>
      Array.from(strip.querySelectorAll(".flap"), (c) => {
        c.textContent = " ";
        return { el: c, cur: 0, token: 0 };
      }),
    );

    function setRow(r, text, animate) {
      if (r < 0 || !rows[r]) return;
      const target = pad(text);
      rows[r].forEach((cell, i) => {
        let ti = ALPHA.indexOf(target.charAt(i));
        if (ti < 0) ti = 0;
        cell.token++;
        if (!animate) {
          cell.cur = ti;
          cell.el.textContent = ALPHA.charAt(ti);
          return;
        }
        if (cell.cur === ti) return;
        let start = cell.cur;
        let steps = (ti - start + ALPHA.length) % ALPHA.length;
        if (steps > 8) {
          start = (ti - 5 - Math.floor(Math.random() * 3) + ALPHA.length) % ALPHA.length;
          steps = (ti - start + ALPHA.length) % ALPHA.length;
        }
        const token = cell.token;
        let k = 0;
        function flip() {
          if (cell.token !== token) return;
          k++;
          cell.cur = (start + k) % ALPHA.length;
          cell.el.textContent = ALPHA.charAt(cell.cur);
          if (cell.el.animate) {
            cell.el.animate(
              [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-75deg)", offset: 0.45 }, { transform: "rotateX(0deg)" }],
              { duration: 90, easing: "ease-in-out" },
            );
          }
          if (k < steps) later(flip, 75);
        }
        later(
          () => {
            if (cell.token !== token) return;
            cell.cur = start;
            cell.el.textContent = ALPHA.charAt(start);
            flip();
          },
          i * 26 + r * 70 + Math.random() * 60,
        );
      });
    }

    let timeRow = -1;
    let nowRow = -1;
    let cycle = [];
    let nowIdx = 0;
    let started = false;
    let boardVis = false;
    let lastT = "";
    const values = strips.map((s, i) => {
      if (s.hasAttribute("data-clock-row")) timeRow = i;
      if (s.hasAttribute("data-cycle")) {
        nowRow = i;
        cycle = s.getAttribute("data-cycle").split("|");
      }
      return s.getAttribute("data-value") || "";
    });

    function startBoard() {
      if (started) return;
      started = true;
      lastT = lagosTime();
      for (let r = 0; r < values.length; r++) setRow(r, r === timeRow ? lastT : values[r], !reduced());
    }

    if (reduced()) startBoard();
    const unwatch = whenVisible(
      el,
      (v) => {
        boardVis = v;
        if (v) startBoard();
      },
      { threshold: 0.3 },
    );
    const clockTimer = setInterval(() => {
      if (!started) return;
      const t = lagosTime();
      if (t !== lastT) {
        lastT = t;
        setRow(timeRow, t, boardVis && !reduced());
      }
    }, 4000);
    const cycleTimer = setInterval(() => {
      if (!started || !boardVis || document.hidden || reduced() || nowRow < 0 || !cycle.length) return;
      nowIdx = (nowIdx + 1) % cycle.length;
      setRow(nowRow, cycle[nowIdx], true);
    }, 5600);

    return () => {
      clearInterval(clockTimer);
      clearInterval(cycleTimer);
      pending.forEach((id) => clearTimeout(id));
      pending.clear();
      rows.forEach((cells) =>
        cells.forEach((cell) => {
          cell.token++;
        }),
      );
      unwatch();
    };
  }, []);

  return (
    <aside className="board-wrap reveal" aria-labelledby="board-title">
      <h3 id="board-title" className="sr-only">
        Quick facts
      </h3>
      <ul className="sr-only">
        {FACTS.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      <div className="board" id="board" aria-hidden="true" ref={boardRef}>
        <p className="board__top">
          <span>Eberechukwu Gerald</span>
          <b>Live</b>
        </p>
        {BOARD_ROWS.map((row) => (
          <div className={row.now ? "board__row board__row--now" : "board__row"} key={row.label}>
            <span className="board__label">{row.label}</span>
            <span
              className="board__cells"
              data-value={row.value}
              data-clock-row={row.clockRow ? "" : undefined}
              data-cycle={row.cycle}
            >
              {FLAPS.map((i) => (
                <span className="flap" key={i}></span>
              ))}
            </span>
          </div>
        ))}
      </div>
      <p className="board__caption">
        <span className="light" aria-hidden="true"></span>Taking on new work this quarter
      </p>
    </aside>
  );
}
