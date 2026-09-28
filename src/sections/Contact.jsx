import { Fragment, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Clock from "../components/Clock";
import Icon from "../components/Icon";
import { CHANNELS, FORM_ACTION } from "../data/contact";

/* Contact form: same checks and messages as before, sent to Formspree. */
const LIMITS = { name: 80, email: 160, subject: 120, message: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = ["name", "email", "subject", "message"];

/* The reference rewrites the notice and error text every time it sets them, even when the words
   are the same, so screen readers hear them again. A new key on each write does the same here. */
function Live({ item }) {
  return item ? <Fragment key={item.n}>{item.text}</Fragment> : null;
}

function check(n, value) {
  const v = String(value || "").trim();
  if (n === "name") return !v ? "Let me know what to call you" : v.length < 2 ? "That looks a little short" : v.length > LIMITS.name ? "That's longer than I can accept" : "";
  if (n === "email") return !v ? "I need an address to reply to" : !EMAIL_RE.test(v) ? "That address doesn't look right" : v.length > LIMITS.email ? "That address is unusually long" : "";
  if (n === "subject") return !v ? "Give the message a subject" : v.length < 3 ? "A few more words would help" : v.length > LIMITS.subject ? "Try to keep the subject short" : "";
  if (n === "message") return !v ? "Tell me a little about it" : v.length < 12 ? "A sentence or two would help me reply properly" : v.length > LIMITS.message ? "That's past the length I can send" : "";
  return "";
}

export default function Contact() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  const touched = useRef({});
  const sendingRef = useRef(false);
  const timerRef = useRef(0);
  const alive = useRef(false);
  // A field has no entry until it is first checked, so aria-invalid starts out absent.
  // Each entry is { text, n }, where n counts the writes.
  const [errors, setErrors] = useState({});
  const [left, setLeft] = useState(LIMITS.message);
  // No data-kind on the notice until the first setNotice.
  const [notice, setNoticeState] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  const refs = { name: nameRef, email: emailRef, subject: subjectRef, message: messageRef };
  function field(n) {
    return refs[n].current;
  }
  function showError(n, msg) {
    setErrors((prev) => ({ ...prev, [n]: { text: msg, n: prev[n] ? prev[n].n + 1 : 1 } }));
  }
  function updateCount() {
    setLeft(LIMITS.message - field("message").value.length);
  }
  function setNotice(kind, text) {
    setNoticeState((prev) => ({ kind, text, n: prev ? prev.n + 1 : 1 }));
  }

  function onBlur(n) {
    return (e) => {
      touched.current[n] = true;
      showError(n, check(n, e.target.value));
    };
  }
  function onInput(n) {
    return (e) => {
      if (touched.current[n]) showError(n, check(n, e.target.value));
      if (n === "message") updateCount();
    };
  }

  function onSubmit(e) {
    e.preventDefault();
    if (sendingRef.current) return;
    let firstBad = null;
    const next = {};
    FIELDS.forEach((n) => {
      touched.current[n] = true;
      const msg = check(n, field(n).value);
      next[n] = msg;
      if (msg && !firstBad) firstBad = field(n);
    });
    if (firstBad) {
      // Errors and the notice are on the page before focus moves, as in the reference.
      flushSync(() => {
        FIELDS.forEach((n) => showError(n, next[n]));
        setNotice("error", "A few fields still need attention.");
      });
      firstBad.focus();
      return;
    }
    FIELDS.forEach((n) => showError(n, next[n]));
    sendingRef.current = true;
    setSending(true);
    setNotice("", "");
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => {
      if (ctrl) ctrl.abort();
    }, 15000);
    timerRef.current = timer;
    const val = (n) => field(n).value.trim();
    fetch(FORM_ACTION, {
      method: "POST",
      signal: ctrl ? ctrl.signal : undefined,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: val("name"), email: val("email"), subject: val("subject"), message: val("message"), _subject: "Portfolio enquiry: " + val("subject") }),
    })
      .then((res) => {
        clearTimeout(timer);
        if (!alive.current) return;
        if (res.ok) {
          // Same as form.reset() here (no field has a default value), but written through
          // the value setter so React's change tracking stays in step with the DOM.
          FIELDS.forEach((n) => {
            field(n).value = "";
          });
          touched.current = {};
          updateCount();
          FIELDS.forEach((n) => showError(n, ""));
          setNotice("sent", "Got it. I'll get back to you within a day.");
        } else {
          setNotice("error", "That didn't go through. Try again, or email me directly.");
        }
      })
      .catch((err) => {
        clearTimeout(timer);
        if (!alive.current) return;
        setNotice(
          "error",
          err && err.name === "AbortError"
            ? "That took too long. Try again, or email me directly."
            : "That didn't go through from here. Email me at sonpele@proton.me instead.",
        );
      })
      .then(() => {
        if (!alive.current) return;
        sendingRef.current = false;
        setSending(false);
      });
  }

  function fieldProps(n) {
    const e = errors[n];
    return {
      "aria-invalid": e === undefined ? undefined : e.text ? "true" : "false",
      "aria-describedby": e && e.text ? "err-" + n : undefined,
      onBlur: onBlur(n),
      onChange: onInput(n),
    };
  }

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact">
        <div className="contact__aside reveal">
          <h2 id="contact-title" className="reveal-wipe">
            Tell me about the project.
          </h2>
          <p className="lede">Or the role you're hiring for. I read everything, and I reply to all of it.</p>
          <ul className="channels">
            {CHANNELS.map((c) => (
              <li key={c.label}>
                <a
                  className="channel"
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                >
                  <span className="ico" aria-hidden="true">
                    <Icon name={c.icon} className={c.fill ? "i i--fill" : "i"} hidden={false} />
                  </span>
                  <div className="channel__text">
                    <small>{c.label}</small>
                    <span>{c.value}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <p className="contact__note">
            <span className="light" aria-hidden="true"></span>Based in Lagos, Nigeria, working with teams in any timezone.
          </p>
        </div>
        <div className="panel reveal" style={{ "--i": 1 }}>
          <p className="panel__head">
            <span className="light" aria-hidden="true"></span>I usually reply the same day<span className="panel__time">Lagos <Clock /></span>
          </p>
          <form className="form" id="contact-form" action={FORM_ACTION} method="POST" noValidate onSubmit={onSubmit}>
            <div className="field field--half">
              <label htmlFor="f-name">Your name</label>
              <input
                className="input"
                id="f-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Obi"
                maxLength={80}
                required
                ref={nameRef}
                {...fieldProps("name")}
              />
              <span className="error" id="err-name" role="alert">
                <Live item={errors.name} />
              </span>
            </div>
            <div className="field field--half">
              <label htmlFor="f-email">Email address</label>
              <input
                className="input"
                id="f-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                maxLength={160}
                required
                ref={emailRef}
                {...fieldProps("email")}
              />
              <span className="error" id="err-email" role="alert">
                <Live item={errors.email} />
              </span>
            </div>
            <div className="field">
              <label htmlFor="f-subject">Subject</label>
              <input
                className="input"
                id="f-subject"
                name="subject"
                type="text"
                autoComplete="off"
                placeholder="New project, or a role you're hiring for"
                maxLength={120}
                required
                ref={subjectRef}
                {...fieldProps("subject")}
              />
              <span className="error" id="err-subject" role="alert">
                <Live item={errors.subject} />
              </span>
            </div>
            <div className="field">
              <div className="field__head">
                <label htmlFor="f-message">Message</label>
                <span className={left < 120 ? "count is-low" : "count"} id="count" aria-hidden="true">
                  {String(left)}
                </span>
              </div>
              <textarea
                className="input"
                id="f-message"
                name="message"
                rows={6}
                placeholder="A sentence or two about the project, roughly when you need it, and anything you already know you want."
                maxLength={2000}
                required
                ref={messageRef}
                {...fieldProps("message")}
              />
              <span className="error" id="err-message" role="alert">
                <Live item={errors.message} />
              </span>
            </div>
            <p className="notice" id="notice" role="status" aria-live="polite" data-kind={notice ? notice.kind : undefined}>
              <Live item={notice} />
            </p>
            <div className="form__foot">
              <button className="btn btn--primary" id="send" type="submit" disabled={sending}>
                {sending ? "Sending" : "Send the message"}
              </button>
              <p className="form__note">Goes straight to my inbox through Formspree. No mailing list, and nothing passed on.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
