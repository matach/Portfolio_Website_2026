export default function HeroContent() {
  return (
    <section className="hero-content" id="hero">
      <div className="hero-content__grid">
        <div className="hero-content__lead">
          <div className="hero-content__kicker">Portfolio / 2026</div>
          <h1 className="hero-content__title">
            Technical Artist
            <span className="hero-content__title-line">&amp; Game Developer</span>
            <span className="hero-content__cursor">_</span>
          </h1>
          <p className="hero-content__subtitle">
            I design real-time visuals and production-ready tools. My focus is
            on rendering, pipeline reliability, and performance under hard
            constraints.
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
                Rendering, tools, performance
              </span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Stack</span>
              <span className="hero-content__panel-value">Unity, HLSL, C#</span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Status</span>
              <span className="hero-content__panel-value">Open for roles</span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Availability</span>
              <span className="hero-content__panel-value">2026 Q1</span>
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
