import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "mathias.achleitner@gmail.com";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const composedSubject = subject || `Portfolio contact from ${name || "Website visitor"}`;
    const composedBody = [
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      "",
      message || "(No message provided)",
    ].join("\n");

    const mailtoHref =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(composedSubject)}` +
      `&body=${encodeURIComponent(composedBody)}`;

    window.location.href = mailtoHref;
    setSubmitted(true);
    e.currentTarget.reset();
  };

  return (
    <section className="contact" id="contact">
      <div className="section-container">
        <p className="section-label">Contact</p>
        <h2 className="section-title">Let's Build Something</h2>
        <p className="contact__subtitle">
          Interested in collaboration, a project, or just want to chat about
          shaders? Send me a message.
        </p>

        <div className="contact__wrapper">
          {submitted ? (
            <div className="contact__success">
              <div className="contact__success-icon">&gt; OK</div>
              <h3>Email Draft Opened</h3>
              <p>
                Your email app should open with a prefilled draft to {CONTACT_EMAIL}.
              </p>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__form-row">
                <div className="contact__field">
                  <label htmlFor="name">&gt; name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="contact__field">
                  <label htmlFor="email">&gt; email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="contact__field">
                <label htmlFor="subject">&gt; subject:</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="What's this about?"
                  required
                />
              </div>
              <div className="contact__field">
                <label htmlFor="message">&gt; message:</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell me about your project..."
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary btn--full">
                [SEND MESSAGE]
              </button>
            </form>
          )}

          <div className="contact__info">
            <div className="contact__info-card">
              <h4>&gt; Email</h4>
              <p>
                <a href="mailto:mathias.achleitner@gmail.com">
                  mathias.achleitner@gmail.com
                </a>
              </p>
            </div>
            <div className="contact__info-card">
              <h4>&gt; GitHub</h4>
              <p>
                <a
                  href="https://github.com/matach"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/matach
                </a>
              </p>
            </div>
            <div className="contact__info-card">
              <h4>&gt; itch.io</h4>
              <p>
                <a
                  href="https://rabid-homunculus.itch.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  rabid-homunculus.itch.io
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
