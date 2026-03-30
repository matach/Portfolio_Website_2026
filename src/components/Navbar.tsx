import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "PROJECTS", href: "#projects" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];
const HERO_ANCHOR = "#hero";
const CV_URL = `${import.meta.env.BASE_URL}mathias_achleitner_cv.pdf`;
const THEME_STORAGE_KEY = "portfolio-theme";
type ThemeMode = "dark" | "light";

export default function Navbar() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {
      // no-op if storage is unavailable
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // no-op if storage is unavailable
    }
  }, [theme]);

  return (
    <aside className="page-rail">
      <div className="page-rail__inner">
        <div className="page-rail__brand">
          <a href={HERO_ANCHOR} className="page-rail__logo">
            MATHIAS/
          </a>
          <span className="page-rail__role">Gameplay Programmer / VFX Artist</span>
        </div>

        <nav className="page-rail__nav">
          <span className="page-rail__nav-label">Index</span>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>[{link.label}]</a>
              </li>
            ))}
          </ul>
          <a
            href={CV_URL}
            className="page-rail__cv"
            target="_blank"
            rel="noopener noreferrer"
          >
            [CV]
          </a>
        </nav>

        <div className="page-rail__meta">
          <div>
            <span className="page-rail__meta-label">Location</span>
            <span className="page-rail__meta-value">EU / Austria</span>
          </div>
          <div>
            <span className="page-rail__meta-label">Status</span>
            <span className="page-rail__meta-value">Open to internships</span>
          </div>
        </div>

        <div className="page-rail__footer">
          <button
            type="button"
            className="page-rail__theme"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle light and dark theme"
          >
            [{theme === "dark" ? "THEME: DARK" : "THEME: LIGHT"}]
          </button>
          <span>Doc: GP-VFX-PORTFOLIO</span>
          <span>Rev: 02</span>
        </div>
      </div>
    </aside>
  );
}
