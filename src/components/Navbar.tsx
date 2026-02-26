const NAV_LINKS = [
  { label: "PROJECTS", href: "#projects" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  return (
    <aside className="page-rail">
      <div className="page-rail__inner">
        <div className="page-rail__brand">
          <a href="#hero" className="page-rail__logo">
            MATHIAS/
          </a>
          <span className="page-rail__role">Technical Artist</span>
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
        </nav>

        <div className="page-rail__meta">
          <div>
            <span className="page-rail__meta-label">Location</span>
            <span className="page-rail__meta-value">EU / Remote</span>
          </div>
          <div>
            <span className="page-rail__meta-label">Status</span>
            <span className="page-rail__meta-value">Open for roles</span>
          </div>
        </div>

        <div className="page-rail__footer">
          <span>Doc: TA-PORTFOLIO</span>
          <span>Rev: 02</span>
        </div>
      </div>
    </aside>
  );
}
