import { profile, socials } from "../../data/profile";
import Icon from "../common/Icon";
import Magnetic from "../common/Magnetic";
import Reveal from "../common/Reveal";
import SectionHeading from "../common/SectionHeading";
import useContactForm from "./useContactForm";
import "./Contact.css";

const FIELDS = [
  {
    name: "name",
    label: "Your name",
    type: "text",
    placeholder: "Ada Obi",
    autoComplete: "name",
    half: true,
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    placeholder: "you@company.com",
    autoComplete: "email",
    half: true,
  },
  {
    name: "subject",
    label: "Subject",
    type: "text",
    placeholder: "New project, or a role you are hiring for",
    autoComplete: "off",
    half: false,
  },
];

function Field({ field, form }) {
  const { values, errors, touched, handleChange, handleBlur, limits } = form;
  const invalid = Boolean(touched[field.name] && errors[field.name]);

  return (
    <div className={`field ${field.half ? "field--half" : ""}`}>
      <label className="field__label" htmlFor={`field-${field.name}`}>
        {field.label}
      </label>
      <input
        id={`field-${field.name}`}
        name={field.name}
        type={field.type}
        className={`field__input ${invalid ? "is-invalid" : ""}`}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
        maxLength={limits[field.name]}
        value={values[field.name]}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={invalid}
        aria-describedby={invalid ? `error-${field.name}` : undefined}
      />
      <span
        id={`error-${field.name}`}
        className={`field__error ${invalid ? "is-shown" : ""}`}
        role="alert"
      >
        {invalid ? errors[field.name] : ""}
      </span>
    </div>
  );
}

export default function Contact() {
  const form = useContactForm();
  const { values, errors, touched, status, notice, limits } = form;

  const messageInvalid = Boolean(touched.message && errors.message);
  const sending = status === "sending";
  const remaining = limits.message - values.message.length;

  return (
    <section id="contact" className="section section--deep contact">
      <div className="shell contact__grid">
        <div className="contact__aside">
          <SectionHeading
            eyebrow="Get in touch"
            eyebrowTone="clay"
            title={["Let us work", { text: "on it together", accent: true }]}
            lede="Whether it is a project that needs building or a role you are hiring for, tell me what you have in mind. I read everything and reply to all of it."
          />

          <ul className="contact__channels">
            {socials.map((item, index) => (
              <Reveal
                as="li"
                key={item.id}
                variant="up"
                delay={index * 80}
                shift={18}
              >
                <a
                  className="channel"
                  href={item.href}
                  target={item.id === "email" ? undefined : "_blank"}
                  rel={item.id === "email" ? undefined : "noreferrer noopener"}
                >
                  <span className="channel__icon" aria-hidden="true">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="channel__text">
                    <span className="channel__label">{item.label}</span>
                    <span className="channel__value">{item.value}</span>
                  </span>
                  <span className="channel__arrow" aria-hidden="true">
                    <Icon name="arrowUpRight" size={16} />
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>

          <Reveal variant="up" delay={420} className="contact__note">
            <span className="contact__note-pulse" aria-hidden="true" />
            Based in {profile.location}, working with teams in any timezone
          </Reveal>
        </div>

        <Reveal variant="left" delay={120} className="contact__panel">
          <form className="form" onSubmit={form.handleSubmit} noValidate>
            <div className="form__rows">
              {FIELDS.map((field) => (
                <Field key={field.name} field={field} form={form} />
              ))}

              <div className="field">
                <div className="field__head">
                  <label className="field__label" htmlFor="field-message">
                    Message
                  </label>
                  <span
                    className={`field__count ${remaining < 120 ? "is-low" : ""}`}
                    aria-hidden="true"
                  >
                    {remaining}
                  </span>
                </div>
                <textarea
                  id="field-message"
                  name="message"
                  rows={6}
                  className={`field__input field__input--area ${
                    messageInvalid ? "is-invalid" : ""
                  }`}
                  placeholder="A sentence or two about the project, the timeline, and anything you already know you want."
                  maxLength={limits.message}
                  value={values.message}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  aria-invalid={messageInvalid}
                  aria-describedby={
                    messageInvalid ? "message-limit error-message" : "message-limit"
                  }
                />
                {/* The visible counter ticks with every keystroke, so it stays
                    hidden from assistive tech and this states the limit once
                    instead. */}
                <span id="message-limit" className="sr-only">
                  Up to {limits.message} characters
                </span>
                <span
                  id="error-message"
                  className={`field__error ${messageInvalid ? "is-shown" : ""}`}
                  role="alert"
                >
                  {messageInvalid ? errors.message : ""}
                </span>
              </div>
            </div>

            <div className="form__foot">
              <Magnetic strength={0.2} max={10} disabled={sending}>
                <button
                  type="submit"
                  className="btn btn--solid form__submit"
                  disabled={sending}
                >
                  <span className="btn__label">
                    {sending ? "Sending" : "Send the message"}
                    <Icon
                      name={sending ? "loader" : "send"}
                      size={16}
                      className={sending ? "form__spinner" : ""}
                    />
                  </span>
                </button>
              </Magnetic>

              {/* Says what actually happens. The form posts to Formspree,
                  which passes the message on to my inbox, so a flat claim that
                  nobody else sees it would not be true. */}
              <p className="form__promise">
                Delivered to my inbox through Formspree. No mailing list, and
                nothing shared onward.
              </p>
            </div>

            <div
              className={`toast toast--${status} ${notice ? "is-shown" : ""}`}
              role="status"
              aria-live="polite"
            >
              {notice ? (
                <>
                  <Icon
                    name={status === "sent" ? "check" : "alert"}
                    size={18}
                    className="toast__icon"
                  />
                  <span>{notice}</span>
                </>
              ) : null}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
