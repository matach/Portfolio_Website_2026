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
      "Shader work for a Master's project I contributed to during my bachelor: an interactive waterfall, Crest Water integration, and an outline pass for cleaner gameplay readability.",
    longDescription:
      "Sonder was a Master's project I helped with during my bachelor. I built a waterfall shader that reacts to objects, matched it with the rest of the water setup, and added an outline shader to help silhouettes read during play. Most of the work was about keeping the look stylized without making it fragile to tune.",
    role: "Shader / VFX Work",
    year: "2025",
    status: "University Project",
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
    title: "Flow Field Studies",
    description:
      "A generative art study in vvvv built around traced flow lines, from soft ribbon shapes to denser contour-like patterns.",
    longDescription:
      "This started as a series of flow-field experiments in vvvv. I kept pushing small parameter changes to see how far the visual language could shift, then curated the runs that felt composed rather than accidental.",
    role: "Creative Coding / Generative Art",
    status: "Creative Coding",
    images: [
      projectImage("flowfield-01.png"),
      projectImage("flowfield-02.png"),
      projectImage("flowfield-03.png"),
      projectImage("flowfield-04.png"),
      projectImage("flowfield-05.png"),
      projectImage("flowfield-06.png"),
      projectImage("flowfield-07.png"),
      projectImage("flowfield-08.png"),
      projectImage("flowfield-09.png"),
      projectImage("flowfield-10.png"),
      projectImage("flowfield-11.png"),
    ],
    features: [
      "Curl and simplex field studies in vvvv",
      "Distinct visual presets ranging from organic ribbons to contour-like cells",
      "High-contrast compositions curated from iterative parameter exploration",
      "Fast experimentation workflow for density, curvature, spacing, and balance",
    ],
    tags: ["vvvv", "Generative Art", "Creative Coding", "Flow Fields"],
    responsibilities: [
      "Built the vvvv setup for field generation and line tracing",
      "Explored parameter sets to produce distinct visual behaviors",
      "Curated the strongest stills into a cohesive visual series",
    ],
    tools: ["vvvv", "Procedural systems", "2D composition", "Parameter exploration"],
    challenge:
      "Finding parameter ranges that produced expressive, readable forms instead of results that felt random or repetitive.",
    color: "#ffffff",
  },
  {
    title: "Vambrace",
    description:
      "A combat authoring tool for a fighting game prototype that let designers inspect, edit, and test move data frame by frame.",
    longDescription:
      "For Vambrace I made an editor tool for building moves and transitions frame by frame. The goal was simple: make combat iteration faster, so designers could preview timing and tweak behavior without digging through raw data.",
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
      "A short VR narrative project set in a World War I trench system, where I handled section pacing and shader work for the painted look.",
    longDescription:
      "Archangel is a VR narrative piece set in a World War I trench system. I worked on the pacing and layout of four gameplay sections and built a fullscreen shader to support the painted visual style. In VR especially, a lot of the work came down to balancing atmosphere with clarity and comfort.",
    role: "Level Design / Shader Work",
    year: "2026",
    status: "University Project",
    images: [
      projectImage("archangel-01.png"),
      projectImage("archangel-02.png"),
      projectImage("archangel-03.png"),
      projectImage("archangel-04.png"),
    ],
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
      "My diploma thesis project: a mobile artillery shooter built around gravity physics, plus supporting VFX and tools work.",
    longDescription:
      "Asteraid was my diploma thesis project. It was a mobile artillery shooter built around gravity physics, and my work covered both the core systems and the supporting presentation: impact VFX, a procedural skybox tool, and a multithreaded gravity simulation. A big part of the project was making those systems work well on mobile without losing responsiveness or readability.",
    role: "Gameplay / Physics / Tools / VFX",
    year: "2022",
    status: "Diploma Thesis Project",
    images: [
      projectImage("asteraid-02.png"),
      projectImage("asteraid-06.gif"),
      projectImage("asteraid-07.gif"),
      projectImage("asteraid-08.gif"),
      projectImage("asteraid-09.gif"),
      projectImage("asteraid-01.png"),
      projectImage("asteraid-03.png"),
      projectImage("asteraid-04.png"),
      projectImage("asteraid-05.png"),
    ],
    features: [
      "Mobile artillery-shooter gameplay built around gravity-driven trajectories",
      "Impact and fragment shaders with controllable intensity and falloff",
      "Stylized breakup visuals tuned for readability at scale",
      "Procedural skybox generation tool with editor UI and fast iteration",
      "Multi-threaded n-body gravity simulation running off the main thread",
      "Optimized for stable frame pacing and reduced spikes on mobile",
      "Debug controls and visualization to stress test body counts",
    ],
    tags: ["Unity", "C#", "Mobile", "Threading"],
    responsibilities: [
      "Worked on gameplay and gravity-based systems for the artillery core",
      "Built impact VFX and related shader work",
      "Created the procedural skybox generation tool",
      "Implemented the multi-threaded gravity simulation",
    ],
    tools: ["Unity", "C#", "Physics systems", "Threading", "Shader work", "Editor tooling"],
    challenge:
      "Making the gravity-heavy gameplay and supporting systems run smoothly on mobile while keeping the feedback readable.",
    color: "#ffffff",
  },
  {
    title: "Long Way Off",
    description:
      "A retro-futurist horror prototype where the player pilots a failing ship through a fake 80s-style operating system.",
    longDescription:
      "Long Way Off is a horror prototype built around a simulated operating system instead of a traditional HUD. I worked on the in-game OS, its file system and programs, plus gameplay code, save logic, CRT shading, and post-processing.",
    role: "Gameplay Programmer / Shader Work",
    year: "2025",
    status: "University Project",
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
      "A split-screen 1v1 jam game where one player runs the course and the other watches through cameras and sabotages with traps.",
    longDescription:
      "M/M was made for Hagenberg GameJam 2023. One player tries to finish an obstacle course while the other watches through camera feeds and triggers traps. I built the runner's movement controller and helped out teammates who were newer to programming.",
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
      "A Five Nights at Freddy's-inspired game jam horror project where I focused on level design.",
    longDescription:
      "One Night at Furbys was made for Hagenberg GameJam 2024. It's a toy-store horror game inspired by Five Nights at Freddy's, and my part was the level design: shaping sightlines, room layout, and the overall pressure of the space.",
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
  const artRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragLastXRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const pendingSlideDirectionRef = useRef<-1 | 0 | 1>(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [frameWidth, setFrameWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const images = project.images ?? [];
  const activeImage = images[activeImageIndex];
  const hasMultipleImages = images.length > 1;
  const prevImage = hasMultipleImages
    ? images[(activeImageIndex - 1 + images.length) % images.length]
    : null;
  const nextImage = hasMultipleImages
    ? images[(activeImageIndex + 1) % images.length]
    : null;
  const canSwipeImages = hasMultipleImages && frameWidth > 0;

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

  const updateFrameWidth = useCallback(() => {
    const art = artRef.current;
    if (!art) return;

    const style = window.getComputedStyle(art);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    setFrameWidth(Math.max(0, art.clientWidth - paddingX));
  }, []);

  useEffect(() => {
    updateFrameWidth();

    if (typeof ResizeObserver === "undefined" || !artRef.current) return;

    const observer = new ResizeObserver(() => updateFrameWidth());
    observer.observe(artRef.current);
    return () => observer.disconnect();
  }, [updateFrameWidth]);

  useEffect(() => {
    setActiveImageIndex(0);
    setDragOffset(0);
    setIsDragging(false);
    setIsSettling(false);
    dragStartXRef.current = null;
    dragLastXRef.current = 0;
    dragLastTimeRef.current = 0;
    dragVelocityRef.current = 0;
    pendingSlideDirectionRef.current = 0;
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

  const clearDragTracking = () => {
    dragStartXRef.current = null;
    dragLastXRef.current = 0;
    dragLastTimeRef.current = 0;
    dragVelocityRef.current = 0;
  };

  const settleCarousel = useCallback(
    (direction: -1 | 0 | 1) => {
      pendingSlideDirectionRef.current = direction;
      clearDragTracking();
      setIsDragging(false);

      if (direction === 0 && Math.abs(dragOffset) < 2) {
        setIsSettling(false);
        setDragOffset(0);
        return;
      }

      setIsSettling(true);

      if (direction === 0 || frameWidth === 0) {
        setDragOffset(0);
        return;
      }

      setDragOffset(direction === 1 ? -frameWidth : frameWidth);
    },
    [dragOffset, frameWidth],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canSwipeImages || isSettling || e.button !== 0) return;

    const now = performance.now();
    dragStartXRef.current = e.clientX;
    dragLastXRef.current = e.clientX;
    dragLastTimeRef.current = now;
    dragVelocityRef.current = 0;
    setIsDragging(true);
    setIsSettling(false);
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null || isSettling) return;

    const now = performance.now();
    const deltaTime = now - dragLastTimeRef.current;
    const deltaX = e.clientX - dragLastXRef.current;
    const nextOffset = e.clientX - dragStartXRef.current;

    if (deltaTime > 0) {
      const velocity = deltaX / deltaTime;
      dragVelocityRef.current = dragVelocityRef.current * 0.35 + velocity * 0.65;
    }

    dragLastXRef.current = e.clientX;
    dragLastTimeRef.current = now;
    setDragOffset(nextOffset);
  };

  const onPointerUpOrCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;

    const distanceThreshold = Math.max(70, Math.min(150, frameWidth * 0.16));
    const velocityThreshold = 0.55;
    const velocity = dragVelocityRef.current;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (dragOffset <= -distanceThreshold || velocity <= -velocityThreshold) {
      settleCarousel(1);
      return;
    }

    if (dragOffset >= distanceThreshold || velocity >= velocityThreshold) {
      settleCarousel(-1);
      return;
    }

    settleCarousel(0);
  };

  const onCarouselTransitionEnd = () => {
    if (!isSettling) return;

    const direction = pendingSlideDirectionRef.current;
    pendingSlideDirectionRef.current = 0;
    setIsSettling(false);
    setDragOffset(0);

    if (direction === 0) return;

    setActiveImageIndex((i) => (i + direction + images.length) % images.length);
  };

  return (
    <div className="project-detail">
      <div
        ref={artRef}
        className={`project-detail__art${canSwipeImages ? " project-detail__art--draggable" : ""}${isDragging ? " project-detail__art--dragging" : ""}${isSettling ? " project-detail__art--transitioning" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrCancel}
        onPointerCancel={onPointerUpOrCancel}
      >
        {canSwipeImages ? (
          <div
            className="project-detail__carousel"
            style={
              {
                transform: `translate3d(${dragOffset - frameWidth}px, 0, 0)`,
              } as CSSProperties
            }
            onTransitionEnd={onCarouselTransitionEnd}
          >
            {[prevImage, activeImage, nextImage].map((image, index) => (
              <div
                key={`${image ?? "empty"}-${index}-${activeImageIndex}`}
                className="project-detail__slide"
                aria-hidden={index !== 1}
              >
                {image ? (
                  <img
                    src={image}
                    alt={index === 1 ? `${project.title} preview ${activeImageIndex + 1}` : ""}
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <span>ARTWORK SLOT</span>
                )}
              </div>
            ))}
          </div>
        ) : activeImage ? (
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
        <p className="project-detail__drag-hint">Drag or swipe left/right to switch</p>
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
