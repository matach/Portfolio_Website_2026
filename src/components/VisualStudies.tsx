const ASSET_BASE = import.meta.env.BASE_URL;

interface Study {
  title: string;
  subtitle: string;
  images: string[];
  layout?: "grid" | "stack";
  link?: string;
  linkLabel?: string;
}

const STUDIES: Study[] = [
  {
    title: "Poster",
    subtitle: "University Coursework / 2D Design",
    images: [`${ASSET_BASE}images/studies/2dd-poster-final.png`],
    link: `${ASSET_BASE}2dd-poster.pdf`,
    linkLabel: "Open PDF",
  },
  {
    title: "Poster Prototype",
    subtitle: "University Coursework / 2D Design",
    images: [`${ASSET_BASE}images/studies/2dd-poster.png`],
  },
  {
    title: "Collage",
    subtitle: "University Coursework / 2D Design",
    images: [`${ASSET_BASE}images/studies/2dd-collage.png`],
  },
  {
    title: "Toy Gorilla",
    subtitle: "University Coursework / 3D Design",
    layout: "stack",
    images: [
      `${ASSET_BASE}images/studies/3dd-toy-gorilla-1.png`,
      `${ASSET_BASE}images/studies/3dd-toy-gorilla-2.png`,
    ],
  },
  {
    title: "Julia Set",
    subtitle: "University Coursework / 3D Design",
    images: [`${ASSET_BASE}images/studies/3dd-julia-set.jpg`],
  },
  {
    title: "Toon Island",
    subtitle: "University Coursework / 3D Design",
    images: [`${ASSET_BASE}images/studies/3dd-toon-island.jpg`],
  },
];

export default function VisualStudies() {
  return (
    <section className="studies" id="design">
      <div className="section-container">
        <p className="section-label">Coursework</p>
        <h2 className="section-title">Design</h2>

        <div className="studies__grid">
          {STUDIES.map((study) => (
            <article key={study.title} className="study-card">
              <div
                className={`study-card__art${
                  study.layout === "stack"
                    ? " study-card__art--stack"
                    : study.images.length > 1
                      ? " study-card__art--grid"
                      : ""
                }`}
              >
                {study.images.map((image, index) => (
                  <img
                    key={`${study.title}-${index}`}
                    src={image}
                    alt={
                      study.images.length > 1
                        ? `${study.title} ${index + 1}`
                        : study.title
                    }
                    loading="lazy"
                  />
                ))}
              </div>

              <div className="study-card__body">
                <p className="study-card__kicker">{study.subtitle}</p>
                <h3 className="study-card__title">{study.title}</h3>

                {study.link && study.linkLabel && (
                  <a
                    href={study.link}
                    className="study-card__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [{study.linkLabel.toUpperCase()}]
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
