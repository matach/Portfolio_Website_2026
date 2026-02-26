import profilePlaceholder from "../assets/profile-placeholder.svg";

const CAPABILITIES = [
  "Unity gameplay + tooling (C#)",
  "Shader development (Shader Graph + HLSL)",
  "Performance profiling + optimization",
  "Pipeline automation + validation",
];

const WORK_STYLE = [
  "Translate visual goals into technical plans that ship on time.",
  "Build artist-friendly tools to reduce repetitive scene and asset setup.",
  "Document decisions so engineering, art, and design stay aligned.",
  "Prototype quickly, then harden systems for production reliability.",
];

const CURRENT_FOCUS = [
  "Junior Technical Artist",
  "Junior Game Developer",
  "Tools / Rendering Support",
  "Real-time Pipeline Assistance",
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
                  src={profilePlaceholder}
                  alt="Profile placeholder"
                  className="about__photo"
                />
              </div>
              <div>
                <p className="about__kicker">Junior Candidate · Technical Art + Gameplay</p>
                <p className="about__role">Building practical tools and polished real-time visuals</p>
                <p className="about__meta">Open to internships / junior roles · Remote or hybrid</p>
              </div>
            </header>

            <div className="about__body">
              <p>
                I&apos;m a junior-level technical artist and game developer focused on the
                space between art direction and engineering delivery. I enjoy taking a
                visual target, understanding its performance cost, and building a clean
                path for teams to implement it confidently.
              </p>
              <p>
                My goal in every project is simple: make the game look better, run
                better, and be easier to work on for the next person.
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
              Available for junior studio roles where I can support production,
              contribute to gameplay systems, and grow under experienced mentors.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
