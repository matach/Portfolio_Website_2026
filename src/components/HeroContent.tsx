export default function HeroContent() {
  return (
    <section className="hero-content" id="hero">
      <div className="hero-content__grid">
        <div className="hero-content__lead">
          <div className="hero-content__kicker">Portfolio / 2026</div>
          <h1 className="hero-content__title">
            <span className="hero-content__title-main">
              <span>Gameplay </span>
              <span>
                Programmer
                <span className="hero-content__cursor">_</span>
              </span>
            </span>
            <span className="hero-content__title-line">&amp; VFX Artist</span>
          </h1>
          <p className="hero-content__subtitle">
            I build gameplay systems, tools, shaders, and effects in Unity and
            Unreal Engine, with a focus on atmosphere, visual feedback, and
            clear implementation.
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
                Gameplay systems, VFX, shaders
              </span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Stack</span>
              <span className="hero-content__panel-value">Unity, UE5, C#, HLSL</span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Status</span>
              <span className="hero-content__panel-value">
                Seeking gameplay programming and VFX internships
              </span>
            </div>
            <div className="hero-content__panel-item">
              <span className="hero-content__panel-key">Availability</span>
              <span className="hero-content__panel-value">2026</span>
            </div>
          </div>
          <div className="hero-content__panel-footer">
            <span>Doc: GP-VFX-PORTFOLIO</span>
            <span>Rev: 02</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
