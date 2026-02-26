import { useState, type FormEvent } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. I'll get back to you soon.</p>
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
              <p>mathias.achleitner@email.com</p>
            </div>
            <div className="contact__info-card">
              <h4>&gt; GitHub</h4>
              <p>github.com/mathias-achleitner</p>
            </div>
            <div className="contact__info-card">
              <h4>&gt; itch.io</h4>
              <p>mathias-achleitner.itch.io</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
