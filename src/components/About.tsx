import { useRef, useState, useEffect } from "react";
import profilePlaceholder from "../assets/profile-placeholder.svg";

const SKILLS = [
  { name: "Unity (tooling, editor scripting, runtime)", level: 90 },
  { name: "Shaders (Shader Graph + HLSL)", level: 88 },
  { name: "Performance Profiling & Optimization", level: 85 },
  { name: "C#", level: 85 },
  { name: "Pipeline & Validation", level: 82 },
];

function AsciiBar({ level }: { level: number }) {
  const filled = Math.round(level / 10);
  const empty = 10 - filled;
  return (
    <span className="skill-bar__ascii">
      [{"#".repeat(filled)}{".".repeat(empty)}]
    </span>
  );
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="about" id="about" ref={ref}>
      <div className="section-container">
        <p className="section-label">About Me</p>
        <h2 className="section-title">About</h2>

        <div className="about__grid">
          <div className="about__text">
            <div className="about__intro-card">
              <div className="about__photo-frame">
                <img
                  src={profilePlaceholder}
                  alt="Placeholder portrait for profile photo"
                  className="about__photo"
                />
              </div>
              <div className="about__intro-copy">
                <p className="about__intro-kicker">Technical Artist / Realtime</p>
                <p className="about__intro-title">Open to Technical Artist opportunities</p>
                <p className="about__intro-meta">Remote-friendly · Rendering · Tools · Pipeline</p>
              </div>
            </div>

            <p>
              I'm a Technical Artist focused on real-time rendering, tools, and
              performance. I enjoy building systems that help teams iterate
              faster -- whether that's a shader that's easy to art-direct, an
              editor tool that reduces friction, or an optimization pass that
              turns "too slow" into shippable.
            </p>
            <p>
              I'm most comfortable working at the intersection of art and
              engineering: translating creative goals into robust real-time
              solutions and communicating constraints clearly.
            </p>
            <p>
              Interested in Technical Artist roles that involve shader work,
              tools, or rendering/pipeline support.
            </p>

            <div className="about__stats">
              <div className="about__stat">
                <span className="about__stat-number">50+</span>
                <span className="about__stat-label">Shaders Created</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">8+</span>
                <span className="about__stat-label">Years Experience</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">12</span>
                <span className="about__stat-label">Shipped Titles</span>
              </div>
            </div>
          </div>

          <div className="about__skills">
            <h3 className="about__skills-title">Core Skills</h3>
            {visible &&
              SKILLS.map((skill) => (
                <div key={skill.name} className="skill-bar">
                  <span className="skill-bar__name">{skill.name}</span>
                  <AsciiBar level={skill.level} />
                  <span className="skill-bar__level">{skill.level}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
