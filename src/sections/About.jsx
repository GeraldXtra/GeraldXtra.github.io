import Route from "../components/Route";
import SplitFlapBoard from "../components/SplitFlapBoard";
import { TIMELINE } from "../data/about";
import { yearsWord } from "../utils/time";

export default function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <h2 id="about-title" className="about__title reveal-wipe">
          Taught myself in 2022. Freelancing since 2024.
        </h2>
        <div className="about__grid">
          <div className="about__body">
            <p className="first reveal">
              I spent two years teaching myself to build for the web, starting in 2022, and I'm currently furthering
              my tech education at Aptech in Ajao Estate, Lagos. The <span data-years="">{yearsWord()}</span> years
              since have gone into freelancing for founders and small teams who needed one person to take a rough idea
              through design and all the way into working code.
            </p>
            <p className="reveal">
              How I work isn't complicated. I sit with the problem until I actually understand it, sketch until the flow
              stops fighting me, then write code someone else can pick up months later without wondering what I was
              thinking.
            </p>
            <p className="reveal">
              All of it happens remotely, and it works because I keep it boring. I write things down, I reply quickly,
              and I show progress often enough that you never have to ask how it's going.
            </p>
            <p className="reveal">
              Recently I built Tessa, a Windows AI assistant that takes the friction out of everyday work on the
              machine, coding included. It watches your downloads too, flags anything malicious before you open it, and
              tells you why.
            </p>
            <p className="reveal">
              Alongside it I built a console that pulls Command Prompt, PowerShell and Git Bash into one window. It talks
              to Tessa directly, so you can hand a task over in plain language without leaving the terminal.
            </p>
            <Route kind="timeline">
              <ol className="timeline" aria-label="Timeline">
                {TIMELINE.map((item) => (
                  <li key={item.year}>
                    <b>{item.year}</b>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
            </Route>
          </div>
          <SplitFlapBoard />
        </div>
      </div>
    </section>
  );
}
