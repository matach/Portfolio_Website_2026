import profilePhoto from "../assets/profile-photo.png";

const CAPABILITIES = [
  "Gameplay systems and tools in Unity/C# and Unreal Engine workflows",
  "Shader development with Shader Graph, HLSL, and post-processing",
  "Real-time VFX focused on readability and feedback",
  "Production-minded implementation including save systems and tooling support",
];

const WORK_STYLE = [
  "I try to keep systems easy to test, tune, and maintain.",
  "I like building tools when they remove repetitive work for the team.",
  "I pay attention to readability, game feel, and performance together.",
  "I work best when I can collaborate closely with design and art.",
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
                  Building player-facing systems and supporting them with clear visuals
                </p>
                <p className="about__meta">Looking for internships - Remote or hybrid</p>
              </div>
            </header>

            <div className="about__body">
              <p>
                I&apos;m a gameplay programmer and VFX artist with experience building
                gameplay features, shaders, tools, and post-processing work for
                student, prototype, and team projects in Unity and Unreal Engine.
              </p>
              <p>
                The part of development I enjoy most is turning an idea into
                something playable and readable on screen, whether that means
                writing gameplay code, building a tool, or making shader and
                effects work that helps set the mood and communicate information
                to the player more clearly.
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
              I&apos;m currently looking for internships where I can contribute to
              gameplay programming or real-time VFX and keep growing in a
              production environment.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
