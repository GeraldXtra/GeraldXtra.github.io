import { marqueeWords } from "../../data/profile";
import "./Marquee.css";

/**
 * A slow band of keywords running between the hero and the first real section.
 *
 * The loop is seamless only when the half of the track that scrolls away is at
 * least as wide as the window, otherwise a gap opens at the seam on a large
 * monitor. Six passes of the list keeps that true well past 4K.
 *
 * The whole band is hidden from assistive technology. Every phrase in it is
 * already stated properly in the sections below, so reading it out six times
 * over would be noise rather than information.
 */
const PASSES = 6;

export default function Marquee({ words = marqueeWords, speed = 46 }) {
  const run = Array.from({ length: PASSES }, () => words).flat();

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__fade marquee__fade--left" />
      <div
        className="marquee__track"
        style={{ "--marquee-speed": `${speed}s` }}
      >
        {run.map((word, index) => (
          <span className="marquee__item" key={`${word}-${index}`}>
            <span className="marquee__word">{word}</span>
            <span className="marquee__mark" />
          </span>
        ))}
      </div>
      <div className="marquee__fade marquee__fade--right" />
    </div>
  );
}
