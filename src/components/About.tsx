import profilePhoto from "../assets/profile-photo.png";

const CAPABILITIES = [
  "Gameplay systems + tooling (Unity/C# and UE5 workflows)",
  "Shader development (Shader Graph, HLSL, fullscreen post effects)",
  "Technical art for readability and atmosphere",
  "Production-focused implementation (save systems, validation, iteration support)",
];

const WORK_STYLE = [
  "Translate visual and design goals into practical systems that ship.",
  "Build tools and workflows that help teams iterate faster under deadlines.",
  "Balance look, readability, and performance from prototype to final pass.",
  "Collaborate closely with design/art and support teammates when needed.",
];

const CURRENT_FOCUS = [
  "Technical Artist / Gameplay Programmer",
  "Tools + Rendering Work",
  "Junior Game Programming Roles",
  "Production-Focused Team Support",
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
                <p className="about__kicker">Technical Art + Gameplay Systems</p>
                <p className="about__role">
                  Building practical game systems and stylized real-time visuals
                </p>
                <p className="about__meta">Open to junior roles - Remote or hybrid</p>
              </div>
            </header>

            <div className="about__body">
              <p>
                I&apos;m a technical artist and gameplay programmer focused on the space
                between visual direction and systems implementation. My recent work
                includes stylized shaders, post-processing, gameplay tools, and
                production gameplay systems across Unity and Unreal Engine projects.
              </p>
              <p>
                I enjoy building features that are both creative and practical:
                custom rendering effects, player-facing systems, and team-friendly
                workflows that help projects look better, run better, and stay
                maintainable.
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
              Looking for junior studio roles where I can contribute to technical
              art and gameplay systems while continuing to grow in production
              environments.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
