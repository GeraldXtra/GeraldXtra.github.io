import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";

const EMPTY = { name: "", email: "", subject: "", message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 80,
  email: 160,
  subject: 120,
  message: 2000,
};

/**
 * Checks one field and returns the message to show, or an empty string when
 * the value is fine. Kept apart from the component so the rules are easy to
 * read in one place.
 */
function checkField(field, raw) {
  const value = String(raw ?? "").trim();

  switch (field) {
    case "name":
      if (!value) return "Let me know what to call you";
      if (value.length < 2) return "That looks a little short";
      if (value.length > LIMITS.name) return "That is longer than I can accept";
      return "";

    case "email":
      if (!value) return "I need an address to reply to";
      if (!EMAIL_PATTERN.test(value)) return "That address does not look right";
      if (value.length > LIMITS.email) return "That address is unusually long";
      return "";

    case "subject":
      if (!value) return "Give the message a subject";
      if (value.length < 3) return "A few more words would help";
      if (value.length > LIMITS.subject) return "Try to keep the subject short";
      return "";

    case "message":
      if (!value) return "Tell me a little about it";
      if (value.length < 12) return "A sentence or two would help me reply well";
      if (value.length > LIMITS.message)
        return "That is past the length I can send";
      return "";

    default:
      return "";
  }
}

/**
 * Holds everything the contact form needs: values, per field errors, which
 * fields have been visited, and the state of the submission itself.
 *
 * A field is only marked wrong once it has been left or the form has been
 * sent, so nobody gets told off while they are still typing their name.
 */
export default function useContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");

  const noticeTimer = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      window.clearTimeout(noticeTimer.current);
    };
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear a complaint as soon as the visitor fixes it.
      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: checkField(name, value) }));
      }
    },
    [touched],
  );

  const handleBlur = useCallback((event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: checkField(name, value) }));
  }, []);

  const announce = useCallback((kind, text) => {
    setStatus(kind);
    setNotice(text);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      if (!alive.current) return;
      setStatus("idle");
      setNotice("");
    }, 7000);
  }, []);

  /**
   * Puts the form into the sending state and, importantly, cancels any notice
   * timer still counting down from an earlier attempt. Left running, that timer
   * would reset the status to idle part way through the request and hand the
   * submit button back to the visitor while it was still in flight.
   */
  const beginSending = useCallback(() => {
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = 0;
    setStatus("sending");
    setNotice("");
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (status === "sending") return;

      const found = {};
      Object.keys(EMPTY).forEach((field) => {
        const message = checkField(field, values[field]);
        if (message) found[field] = message;
      });

      setTouched({ name: true, email: true, subject: true, message: true });
      setErrors(found);

      if (Object.keys(found).length) {
        announce("error", "A few fields still need attention.");
        // Put the visitor on the first thing that needs fixing, but only once
        // React has painted the error state. Focusing synchronously would land
        // on a field that does not carry aria-invalid or its description yet,
        // so a screen reader would read it as though nothing were wrong.
        const first = Object.keys(EMPTY).find((field) => found[field]);
        window.requestAnimationFrame(() => {
          document.getElementById(`field-${first}`)?.focus();
        });
        return;
      }

      beginSending();

      // A request that never settles would leave the button disabled forever,
      // so it gets a ceiling.
      const abort = new AbortController();
      const cutoff = window.setTimeout(() => abort.abort(), 15000);

      try {
        const response = await fetch(profile.formEndpoint, {
          method: "POST",
          signal: abort.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: values.name.trim(),
            email: values.email.trim(),
            subject: values.subject.trim(),
            message: values.message.trim(),
            _subject: `Portfolio enquiry: ${values.subject.trim()}`,
          }),
        });

        window.clearTimeout(cutoff);
        if (!alive.current) return;

        if (response.ok) {
          setValues(EMPTY);
          setTouched({});
          setErrors({});
          announce(
            "sent",
            "Message received. I will get back to you within a day.",
          );
          return;
        }

        announce(
          "error",
          "That did not go through. Try again, or email me directly.",
        );
      } catch (error) {
        window.clearTimeout(cutoff);
        if (!alive.current) return;
        announce(
          "error",
          error?.name === "AbortError"
            ? "That took too long. Try again, or email me directly."
            : "No connection. Check your network and try again.",
        );
      }
    },
    [values, status, announce, beginSending],
  );

  return {
    values,
    errors,
    touched,
    status,
    notice,
    limits: LIMITS,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
