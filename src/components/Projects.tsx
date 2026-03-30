import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  color: string;
  images?: string[];
  longDescription?: string;
  role?: string;
  features?: string[];
  links?: { label: string; url: string }[];
  year?: string;
  status?: string;
  responsibilities?: string[];
  tools?: string[];
  challenge?: string;
}

const ASSET_BASE = import.meta.env.BASE_URL;
const projectImage = (fileName: string) => `${ASSET_BASE}images/projects/${fileName}`;

const PROJECTS: Project[] = [
  {
    title: "Sonder",
    description:
      "Water and readability work for a commercial project, including an interactive waterfall shader, Crest Water integration, and an outline shader for gameplay clarity.",
    longDescription:
      "For Sonder, I built a waterfall shader with object interaction and integrated Crest Water into the rest of the scene. I also made an outline shader to improve silhouette readability during gameplay. The work was focused on keeping the visuals stylized while staying practical to tune and stable to run.",
    role: "Shader / VFX Work",
    year: "2025",
    status: "In Development",
    images: [
      projectImage("sonder-03.png"),
      projectImage("sonder-01.png"),
      projectImage("sonder-02.png"),
    ],
    features: [
      "Stylized waterfall shading with controllable flow, foam, and turbulence",
      "Object-driven interaction response on surface, foam, and flow",
      "Consistent look between custom shader water and Crest water",
      "Custom outline shader to improve silhouette readability",
    ],
    tags: ["Unity", "URP", "Shader Graph", "HLSL", "Crest Water"],
    responsibilities: [
      "Built the interactive waterfall shader",
      "Integrated Crest Water with the rest of the scene setup",
      "Created an outline shader to improve gameplay readability",
    ],
    tools: ["Unity", "URP", "Shader Graph", "HLSL", "Crest Water"],
    challenge:
      "Keeping the water stylized and readable while making the interaction stable enough to use in-game.",
    links: [
      {
        label: "Steam",
        url: "https://store.steampowered.com/app/3700110/SONDER_Embrace_The_World/",
      },
    ],
    color: "#ffffff",
  },
  {
    title: "Vambrace",
    description:
      "Frame-by-frame combat authoring tool for a fighting game prototype, built to help designers preview, edit, and test move data more quickly.",
    longDescription:
      "For Vambrace, I built an editor tool for authoring moves and transitions frame by frame. The goal was to make combat tuning faster by letting designers inspect timing, preview behavior, and adjust data without hand-editing assets.",
    role: "Tools Programmer (Combat Authoring)",
    year: "2024",
    status: "Prototype",
    images: [projectImage("vambrace-01.png"), projectImage("vambrace-02.png")],
    features: [
      "Frame-by-frame move authoring workflow (startup/active/recovery phases)",
      "Preview window for scrubbing, playback, and rapid iteration",
      "Transition and timing support for cancel/branch rules",
      "Visualization tools to debug move behavior and frame data",
      "Guardrails and validation to catch common authoring errors",
    ],
    tags: ["Unity", "C#", "Editor Tooling"],
    responsibilities: [
      "Built the move authoring editor tool",
      "Added preview and scrubbing for combat timing",
      "Set up transition editing and validation support",
    ],
    tools: ["Unity", "C#", "Custom editor tooling"],
    challenge:
      "Reducing combat iteration time by making move data easier to inspect and tune.",
    color: "#ffffff",
  },
  {
    title: "Archangel (VR)",
    description:
      "Short narrative VR experience set in a World War I trench system, with pacing and environmental storytelling shaped across four gameplay sections.",
    longDescription:
      "Archangel is a short VR narrative project set in a World War I trench system. I worked on level design across four gameplay sections and created a fullscreen shader to support the painted visual style. The work combined pacing, readability, and atmosphere, especially in VR where comfort and clarity matter.",
    role: "Level Design / Shader Work",
    year: "2026",
    status: "In Development",
    images: [projectImage("archangel-01.png"), projectImage("archangel-02.png")],
    features: [
      "Level design for four gameplay sections with deliberate pacing progression",
      "Early concept contribution for mood, tone, and visual direction",
      "Custom fullscreen painted shader for the game's signature look",
      "VR-focused visual readability and comfort considerations",
    ],
    tags: ["Unity", "VR", "Level Design", "Shader Development", "Narrative Design"],
    responsibilities: [
      "Designed and paced four gameplay sections",
      "Built the fullscreen shader for the painted look",
      "Supported early concept and atmosphere work",
    ],
    tools: ["Unity", "VR", "Shader Graph/HLSL", "Level design workflows"],
    challenge:
      "Balancing atmosphere and visual style with readability and comfort in VR.",
    color: "#ffffff",
  },
  {
    title: "Asteraid",
    description:
      "Prototype work covering mobile VFX, a procedural skybox tool, and a multi-threaded gravity simulation built with performance in mind.",
    longDescription:
      "For Asteraid, I worked on several systems: impact VFX, a procedural skybox tool, and a multi-threaded n-body gravity simulation. The main challenge was keeping the work practical for mobile performance while still giving enough visual and gameplay feedback.",
    role: "Gameplay / Tools / VFX",
    year: "2022",
    status: "Prototype",
    images: [
      projectImage("asteraid-01.png"),
      projectImage("asteraid-02.png"),
      projectImage("asteraid-03.png"),
      projectImage("asteraid-04.png"),
      projectImage("asteraid-05.png"),
    ],
    features: [
      "Impact and fragment shaders with controllable intensity and falloff",
      "Stylized breakup visuals tuned for readability at scale",
      "Procedural skybox generation tool with editor UI and fast iteration",
      "Multi-threaded n-body gravity simulation running off the main thread",
      "Optimized for stable frame pacing and reduced spikes on mobile",
      "Debug controls and visualization to stress test body counts",
    ],
    tags: ["Unity", "C#", "Mobile", "Threading"],
    responsibilities: [
      "Built impact VFX and related shader work",
      "Created the procedural skybox generation tool",
      "Implemented the multi-threaded gravity simulation",
    ],
    tools: ["Unity", "C#", "Threading", "Shader work", "Editor tooling"],
    challenge:
      "Making multiple systems run well enough for mobile while still giving clear visual feedback.",
    color: "#ffffff",
  },
  {
    title: "Long Way Off",
    description:
      "Iron Lung-inspired horror game where the player pilots a failing spaceship through a simulated retro 80s-style control panel operating system.",
    longDescription:
      "Long Way Off is a horror project where the player controls a failing spaceship through a simulated retro operating system. I built the in-game OS, including the file system and interactive programs, and also handled gameplay code, the save system, CRT screen shading, and post-processing.",
    role: "Gameplay Programmer / Shader Work",
    year: "2025",
    status: "Prototype",
    images: [projectImage("longwayoff-01.png"), projectImage("longwayoff-02.png")],
    features: [
      "Fully simulated in-game operating system",
      "File system and multiple interactive control programs",
      "Custom CRT shader for ship display screens",
      "Save system implementation",
      "Gameplay programming for ship interaction systems",
    ],
    tags: ["Unity", "C#", "Horror", "Systems Programming", "Shaders"],
    responsibilities: [
      "Built the in-game operating system and file system",
      "Implemented the interactive ship control programs",
      "Handled gameplay code, save system, CRT shader, and post-processing",
    ],
    tools: ["Unity", "C#", "Systems programming", "Shaders", "Post-processing"],
    challenge:
      "Making the simulated operating system feel like a real gameplay interface instead of just a visual gimmick.",
    color: "#ffffff",
  },
  {
    title: "M/M",
    description:
      "Split-screen 1v1 game jam project where one player runs an obstacle course while the other monitors cameras and sabotages with traps.",
    longDescription:
      "M/M was created for Hagenberg GameJam 2023. It is a split-screen 1v1 game: Player 1 tries to complete an obstacle course while Player 2 monitors them over camera feeds and triggers traps to slow them down. I programmed the movement controller for the player navigating the obstacle course, focusing on responsive controls and consistent feel under pressure, and I also helped teammates who were newer to programming.",
    role: "Gameplay Programmer (Player Controller)",
    year: "2023",
    status: "GameJam",
    images: [projectImage("mm-01.png")],
    features: [
      "Asymmetric split-screen 1v1 gameplay loop",
      "Player movement controller tuned for responsiveness and control",
      "Camera-monitoring and trap-trigger counterplay",
      "Programming support for teammates newer to coding",
    ],
    tags: ["Unity", "C#", "GameJam", "Multiplayer"],
    responsibilities: [
      "Programmed the player movement controller",
      "Focused on responsive controls for the runner role",
      "Supported teammates with programming tasks during the jam",
    ],
    tools: ["Unity", "C#", "Gameplay programming"],
    challenge:
      "Getting movement to feel reliable and responsive in a short game jam timeframe.",
    links: [
      {
        label: "GameJam Page",
        url: "https://hagenberg-gamejam.at/2023/mm",
      },
    ],
    color: "#ffffff",
  },
  {
    title: "One Night at Furbys",
    description:
      "FNaF-style horror game jam project where my contribution was level design.",
    longDescription:
      "One Night at Furbys was created for the 2024 Hagenberg GameJam. It is a Five Nights at Freddy's style horror game where the player starts a new night-guard job in a toy store and discovers the furbys are cursed. The core objective is to survive until morning while managing threats and tension. My role on this project was level design.",
    role: "Level Designer",
    year: "2024",
    status: "GameJam",
    images: [
      projectImage("furbys-02.png"),
      projectImage("furbys-01.png"),
      projectImage("furbys-03.png"),
    ],
    features: [
      "FNaF-inspired survival-horror game",
      "Toy-store setting built for escalating tension",
      "Level design focused on sightlines and player pressure"
    ],
    links: [
      {
        label: "GameJam Page",
        url: "https://hagenberg-gamejam.at/2024/one-night-at-furbys",
      },
    ],
    tags: ["Unreal Engine 5", "Level Design", "GameJam", "Horror"],
    responsibilities: [
      "Worked on level design for the toy-store setting",
      "Shaped sightlines and room layout for tension",
      "Supported the horror pacing through environment setup",
    ],
    tools: ["Unreal Engine 5", "Level design"],
    challenge:
      "Using a small game jam environment to create tension and keep the player under pressure.",
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
  const primaryImage = project.images?.[0];

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
      style={
        {
          "--reveal-delay": `${index * 0.08}s`,
        } as CSSProperties
      }
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
        {primaryImage ? (
          <img src={primaryImage} alt="" loading="lazy" />
        ) : (
          <span>ARTWORK SLOT</span>
        )}
        {project.images && project.images.length > 1 && (
          <span className="project-card__image-count">
            [+{project.images.length - 1}]
          </span>
        )}
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
  const dragStartXRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = project.images ?? [];
  const activeImage = images[activeImageIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
  }, [hasMultipleImages, images.length]);

  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((i) => (i + 1) % images.length);
  }, [hasMultipleImages, images.length]);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
    setDragOffset(0);
    dragStartXRef.current = null;
  }, [project]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onBack, handlePrevImage, handleNextImage]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    dragStartXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;
    setDragOffset(e.clientX - dragStartXRef.current);
  };

  const onPointerUpOrCancel = () => {
    if (dragStartXRef.current === null) return;
    const threshold = 60;
    if (dragOffset >= threshold) {
      handlePrevImage();
    } else if (dragOffset <= -threshold) {
      handleNextImage();
    }
    dragStartXRef.current = null;
    setDragOffset(0);
  };

  return (
    <div className="project-detail">
      <div
        className={`project-detail__art${hasMultipleImages ? " project-detail__art--draggable" : ""}`}
        style={{ "--drag-offset": `${dragOffset}px` } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrCancel}
        onPointerCancel={onPointerUpOrCancel}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={`${project.title} preview ${activeImageIndex + 1}`}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span>ARTWORK SLOT</span>
        )}
      </div>
      {hasMultipleImages && (
        <div className="project-detail__gallery-controls" aria-label="Project image navigation">
          <button
            type="button"
            className="project-detail__gallery-btn"
            onClick={handlePrevImage}
            aria-label="Previous image"
          >
            {"[<]"}
          </button>
          <span className="project-detail__gallery-count">
            {`[${activeImageIndex + 1}/${images.length}]`}
          </span>
          <button
            type="button"
            className="project-detail__gallery-btn"
            onClick={handleNextImage}
            aria-label="Next image"
          >
            {"[>]"}
          </button>
        </div>
      )}
      <button
        ref={backRef}
        className="project-detail__back"
        onClick={onBack}
      >
        [BACK]
      </button>
      {hasMultipleImages && (
        <p className="project-detail__drag-hint">Drag image left/right to switch</p>
      )}

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

      <div className="project-detail__summary-grid">
        {project.responsibilities && project.responsibilities.length > 0 && (
          <div className="project-detail__summary-block">
            <h3 className="project-detail__summary-title">What I Did</h3>
            <ul className="project-detail__summary-list">
              {project.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {project.tools && project.tools.length > 0 && (
          <div className="project-detail__summary-block">
            <h3 className="project-detail__summary-title">Tools</h3>
            <ul className="project-detail__summary-list">
              {project.tools.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {project.challenge && (
          <div className="project-detail__summary-block project-detail__summary-block--wide">
            <h3 className="project-detail__summary-title">Key Challenge</h3>
            <p className="project-detail__summary-text">{project.challenge}</p>
          </div>
        )}
      </div>

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

  useEffect(() => {
    const onProjectsAnchorClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const projectsAnchor = target?.closest('a[href="#projects"]');
      if (!projectsAnchor || !selectedProject) return;
      e.preventDefault();
      handleBack();
    };

    document.addEventListener("click", onProjectsAnchorClick);
    return () => document.removeEventListener("click", onProjectsAnchorClick);
  }, [selectedProject, handleBack]);

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
