import BackgroundCanvas from "./components/BackgroundCanvas";
import Navbar from "./components/Navbar";
import HeroContent from "./components/HeroContent";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";

export default function App() {
  return (
    <>
      <BackgroundCanvas />
      <div className="site-content">
        <div className="page-shell">
          <Navbar />
          <main className="page-main">
            <HeroContent />
            <Projects />
            <About />
            <Contact />
            <footer className="footer">
              <p>&copy; 2026 -- Built with React, TypeScript &amp; WebGL shaders</p>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}

