import profilePhoto from "../assets/profile-photo.png";

const CAPABILITIES = [
  "Gameplay systems, tools, and editor workflows in Unity/C# and Unreal",
  "Shaders and post-processing in Shader Graph and HLSL",
  "Real-time VFX that supports readability, timing, and feel",
  "Production-friendly implementation, tuning, and debugging support",
];

const WORK_STYLE = [
  "I like keeping systems easy to tune, test, and hand off.",
  "If a workflow gets repetitive, I usually want to build a tool for it.",
  "I care about readability, feel, and performance at the same time.",
  "I like working closely with design and art instead of treating them as separate lanes.",
];

const CURRENT_FOCUS = [
  "Gameplay Programming Internship",
  "VFX / Shader Internship",
  "Junior Gameplay Programmer Role",
  "Junior VFX Artist Role",
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="section-container">
        <p className="section-label">About Me</p>
        <h2 className="section-title">About</h2>

        <div className="about__layout">
          <article className="about__panel about__panel--intro">
            <header className="about__header">
              <div className="about__photo-frame">
                <img
                  src={profilePhoto}
                  alt="Mathias Achleitner"
                  className="about__photo"
                />
              </div>
              <div>
                <p className="about__kicker">Gameplay Programming + Real-Time VFX</p>
                <p className="about__role">
                  Gameplay programmer with a soft spot for shaders and VFX
                </p>
                <p className="about__meta">Looking for internships - remote or hybrid</p>
              </div>
            </header>

            <div className="about__body">
              <p>
                I&apos;m a gameplay programmer and VFX artist based in Austria. Most
                of my work so far has been in student projects, game jams, and
                small team productions built in Unity and Unreal.
              </p>
              <p>
                What I enjoy most is the point where mechanics and presentation
                meet. Sometimes that means gameplay code or editor tooling,
                sometimes a shader or an effect, but the goal is usually the
                same: make the game easier to read, better to tune, and more
                satisfying to play.
              </p>
            </div>
          </article>

          <article className="about__panel">
            <h3 className="about__panel-title">Core Capability</h3>
            <ul className="about__list">
              {CAPABILITIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="about__panel">
            <h3 className="about__panel-title">How I Work</h3>
            <ul className="about__list">
              {WORK_STYLE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="about__panel about__panel--focus">
            <h3 className="about__panel-title">Current Search</h3>
            <ul className="about__tags">
              {CURRENT_FOCUS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="about__footnote">
              I&apos;m looking for a place where I can contribute to gameplay
              programming or real-time VFX, learn from experienced teammates,
              and keep getting sharper in production.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
