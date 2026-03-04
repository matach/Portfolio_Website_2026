export default function HeroContent() {
  return (
    <section className="hero-content" id="hero">
      <div className="hero-content__grid">
        <div className="hero-content__lead">
          <div className="hero-content__kicker">Portfolio / 2026</div>
          <h1 className="hero-content__title">
            Technical Artist
            <span className="hero-content__title-line">&amp; Gameplay Programmer</span>
            <span className="hero-content__cursor">_</span>
          </h1>
          <p className="hero-content__subtitle">
            I build gameplay systems, tools, and real-time visuals for projects
            in Unity and Unreal Engine. My focus is practical implementation:
            clear player-facing behavior, maintainable tech, and strong visual
            readability.
          </p>
          <div className="hero-content__cta">
            <a href="#projects" className="btn btn--primary">
              [VIEW PROJECTS]
            </a>
            <a href="#contact" className="btn btn--outline">
              [CONTACT]
            </a>
          </div>
        </div>

        <aside className="hero-content__panel">
          <div className="hero-content__panel-header">
            <span className="hero-content__panel-label">$ Mathias Achleitner</span>
            <span className="hero-content__panel-index">IDX 001</span>
          </div>
          <div className="hero-content__panel-grid">
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Focus</span>
              <span className="hero-content__panel-value">
                Gameplay systems, shaders, tools
              </span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Stack</span>
              <span className="hero-content__panel-value">Unity, UE5, C#, HLSL</span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Status</span>
              <span className="hero-content__panel-value">Open for junior roles</span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Availability</span>
              <span className="hero-content__panel-value">2026</span>
            </div>
          </div>
          <div className="hero-content__panel-footer">
            <span>Doc: TA-PORTFOLIO</span>
            <span>Rev: 02</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
