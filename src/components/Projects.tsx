import { useState, useRef, useEffect, useCallback } from "react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  color: string;
  longDescription?: string;
  role?: string;
  features?: string[];
  links?: { label: string; url: string }[];
  year?: string;
  status?: string;
}

const PROJECTS: Project[] = [
  {
    title: "Sonder",
    description:
      "Dynamic waterfall shader with object interaction and Crest Water integration for a stylized, readable water look that stays performant in gameplay.",
    longDescription:
      "For Sonder, I created a dynamic waterfall shader with object interaction and integrated Crest Water to bring the rest of the water system to life. My goal was to deliver a stylized, readable water look that remains stable and performant in gameplay. The shader is structured to be artist-friendly: predictable parameters, safe defaults, and a workflow that supports fast iteration.",
    role: "Technical Artist (Shaders / Rendering / Integration)",
    year: "2025",
    status: "Shipped",
    features: [
      "Stylized waterfall shading with controllable flow, foam, and turbulence",
      "Object-driven interaction response on surface, foam, and flow",
      "Consistent look between custom shader water and Crest water",
      "Quality/performance-minded options with distance fade and cheaper variants",
      "Material parameter groups and presets for quick art direction changes",
    ],
    tags: ["Unity", "URP", "Shader Graph", "HLSL", "Crest Water"],
    color: "#ffffff",
  },
  {
    title: "Vambrace",
    description:
      "Frame-by-frame move authoring editor tool for a fighting game -- lets designers scrub, preview, and set transitions to speed up combat iteration.",
    longDescription:
      "Vambrace is a fighting game prototype where I developed an editor tool to author moves and transitions frame-by-frame. The goal was to dramatically speed up iteration for combat design by making gameplay data visual, editable, and testable without hand-editing assets. The tool turns combat tuning into a fast feedback loop: tweak, preview, test -- without constantly switching context.",
    role: "Technical Artist / Tools Programmer",
    year: "2024",
    status: "Prototype",
    features: [
      "Frame-by-frame move authoring workflow (startup/active/recovery phases)",
      "Preview window for scrubbing, playback, and rapid iteration",
      "Transition and timing support for cancel/branch rules",
      "Visualization tools to debug move behavior and frame data",
      "Guardrails and validation to catch common authoring errors",
    ],
    tags: ["Unity", "C#", "Editor Tooling"],
    color: "#ffffff",
  },
  {
    title: "Archangel (VR)",
    description:
      "Painterly post-processing via fullscreen Kuwahara filter with quality tiers, built for VR frame-time constraints and visual stability.",
    longDescription:
      "For Archangel, I implemented a fullscreen Kuwahara-based post-process to give the game a painterly, illustrative look. Because the project targets VR, I focused on balancing stylization with performance and visual stability. I treated the effect like a shippable feature: scalable quality, predictable cost, and clear guidance on when to use or reduce it.",
    role: "Technical Artist (Rendering / Post-Processing) + Level Design",
    year: "2023",
    status: "Shipped",
    features: [
      "Fullscreen Kuwahara filter as a stylized post-processing effect",
      "Painterly abstraction while preserving edges and gameplay silhouettes",
      "Adjustable quality settings (kernel size / downsampling / fallbacks)",
      "VR-aware approach: stability, comfort, and performance-minded tradeoffs",
      "Level design with lighting and composition to support the painterly style",
    ],
    tags: ["Unity", "C#", "HLSL", "VR"],
    color: "#ffffff",
  },
  {
    title: "Asteraid",
    description:
      "Mobile VFX, procedural skybox tool, and multi-threaded n-body gravity simulation -- multiple TA-style systems built for mobile performance.",
    longDescription:
      "Asteraid is a game prototype where I developed multiple systems: VFX shaders for planetary impacts, a procedural skybox generation tool, and a multi-threaded n-body simulation to handle gravity at mobile-friendly performance. This is a production-style performance problem: real-time physics-like computation under tight budgets.",
    role: "Technical Artist / Gameplay Programming / Tools",
    year: "2022",
    status: "Prototype",
    features: [
      "Impact and fragment shaders with controllable intensity and falloff",
      "Stylized breakup visuals tuned for readability at scale",
      "Procedural skybox generation tool with editor UI and fast iteration",
      "Multi-threaded n-body gravity simulation running off the main thread",
      "Optimized for stable frame pacing and reduced spikes on mobile",
      "Debug controls and visualization to stress test body counts",
    ],
    tags: ["Unity", "C#", "Mobile", "Threading"],
    color: "#ffffff",
  },
];

type AnimState = "grid" | "exiting" | "entering" | "detail";

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`project-card ${visible ? "project-card--visible" : ""}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="project-card__index">
        [{String(index + 1).padStart(2, "0")}]
      </span>
      {(project.year || project.status) && (
        <span className="project-card__meta">
          {project.year && <span>{project.year}</span>}
          {project.year && project.status && (
            <span className="project-card__meta-divider">/</span>
          )}
          {project.status && <span>{project.status}</span>}
        </span>
      )}
      <div className="project-card__art" aria-hidden="true">
        <span>ARTWORK SLOT</span>
      </div>
      <h3 className="project-card__title">{project.title}</h3>
      {project.role && (
        <p className="project-card__role">{project.role}</p>
      )}
      <p className="project-card__desc">{project.description}</p>
      <div className="project-card__tags">
        {project.tags.map((tag) => (
          <span key={tag} className="project-card__tag">
            [{tag}]
          </span>
        ))}
      </div>
      <span className="project-card__prompt">&gt; view details_</span>
    </div>
  );
}

function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onBack]);

  return (
    <div className="project-detail">
      <div className="project-detail__art" aria-hidden="true">
        <span>ARTWORK SLOT</span>
      </div>
      <button
        ref={backRef}
        className="project-detail__back"
        onClick={onBack}
      >
        [BACK]
      </button>

      <h2 className="project-detail__title">{project.title}</h2>

      {project.role && (
        <p className="project-detail__role">&gt; {project.role}</p>
      )}
      {(project.year || project.status) && (
        <p className="project-detail__meta">
          {project.year && <span>{project.year}</span>}
          {project.year && project.status && (
            <span className="project-detail__meta-divider"> / </span>
          )}
          {project.status && <span>{project.status}</span>}
        </p>
      )}

      <div className="project-detail__tags">
        {project.tags.map((tag) => (
          <span key={tag} className="project-detail__tag">
            [{tag}]
          </span>
        ))}
      </div>

      <p className="project-detail__description">
        {project.longDescription || project.description}
      </p>

      {project.features && project.features.length > 0 && (
        <>
          <h3 className="project-detail__features-title">Features</h3>
          <ul className="project-detail__features">
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {project.links && project.links.length > 0 && (
        <div className="project-detail__links">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="project-detail__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              [{link.label}]
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [animState, setAnimState] = useState<AnimState>("grid");
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToSection = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSelect = useCallback(
    (project: Project) => {
      setAnimState("exiting");
      setTimeout(() => {
        setSelectedProject(project);
        setAnimState("entering");
        scrollToSection();
        setTimeout(() => {
          setAnimState("detail");
        }, 300);
      }, 250);
    },
    [scrollToSection],
  );

  const handleBack = useCallback(() => {
    setAnimState("exiting");
    setTimeout(() => {
      setSelectedProject(null);
      setAnimState("entering");
      scrollToSection();
      setTimeout(() => {
        setAnimState("grid");
      }, 300);
    }, 250);
  }, [scrollToSection]);

  const isGrid = !selectedProject;
  const isExiting = animState === "exiting";
  const isEntering = animState === "entering";

  return (
    <section className="projects" id="projects" ref={sectionRef}>
      <div className="section-container">
        <p className="section-label">Portfolio</p>
        <h2 className="section-title">Featured Projects</h2>

        {isGrid ? (
          <div
            className={`projects__grid${isExiting ? " projects__grid--exiting" : ""}${isEntering ? " projects__grid--entering" : ""}`}
          >
            {PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
                onClick={() => handleSelect(project)}
              />
            ))}
          </div>
        ) : (
          <div
            className={`projects__detail-wrapper${isExiting ? " projects__detail-wrapper--exiting" : ""}${isEntering ? " projects__detail-wrapper--entering" : ""}`}
          >
            <ProjectDetail project={selectedProject} onBack={handleBack} />
          </div>
        )}
      </div>
    </section>
  );
}

