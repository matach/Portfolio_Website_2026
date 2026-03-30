import { useEffect, useRef } from "react";

/* ── Tunables ── */
const PARTICLE_COUNT = 120;
const CONNECT_DIST = 150;
const MOUSE_RADIUS = 200;
const MOUSE_STRENGTH = 0.0075;
const BASE_SPEED = 0.15;
const WOBBLE_AMP = 0.1;
const GRID_CELL = CONNECT_DIST;
const EDGE_ALPHA = 0.14;
const EDGE_WIDTH = 0.8;
const FACET_ALPHA = 0.035;
const FACET_EDGE_FADE_START = 0.56;
const FACET_CONNECT_DIST_MULTIPLIER = 1.12;
const FACET_COLOR_BLEND = 0.08;
const SCANLINE_ALPHA = 0.018;
const VIGNETTE_ALPHA = 0.4;
const HERO_ZONE_RADIUS = 280;
const HERO_TITLE_BOOST = 0.32;
const SHOCKWAVE_DRAW_ALPHA = 0.28;
const SHOCKWAVE_DRAW_WIDTH = 1.6;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/* ── Depth layers ── */
const LAYER_COUNTS = [45, 45, 30];
const DEPTH_SCALES = [
  { radius: 0.3, speed: 0.26, brightness: 0.26, wobble: 0.18, mouse: 0.14, scroll: 0.03 },
  { radius: 0.68, speed: 0.62, brightness: 0.68, wobble: 0.58, mouse: 0.54, scroll: 0.08 },
  { radius: 1.08, speed: 1.12, brightness: 1.08, wobble: 1.08, mouse: 1.08, scroll: 0.16 },
];

/* ── Shockwave ── */
const SHOCKWAVE_SPEED = 600;
const SHOCKWAVE_FORCE = 8;
const SHOCKWAVE_DURATION = 1.5;
const MAX_SHOCKWAVES = 3;

/* ── Types ── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  brightness: number;
  color: readonly [number, number, number];
  phase: number;
  depth: number;
}

interface Shockwave {
  x: number;
  y: number;
  time: number;
}

interface Palette {
  bg: string;
  bgRgb: [number, number, number];
  fg: [number, number, number];
  fgDim: [number, number, number];
  accent: [number, number, number];
}

function parseCssColor(value: string): [number, number, number] {
  const color = value.trim();
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  const rgb = color.match(/\d+/g);
  if (rgb && rgb.length >= 3) {
    return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
  }
  return [255, 255, 255];
}

function rgba([r, g, b]: [number, number, number], a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

function mixColor(
  source: [number, number, number],
  target: [number, number, number],
  amount: number,
): [number, number, number] {
  const t = clamp01(amount);
  return [
    Math.round(source[0] + (target[0] - source[0]) * t),
    Math.round(source[1] + (target[1] - source[1]) * t),
    Math.round(source[2] + (target[2] - source[2]) * t),
  ];
}

function getSectionProfile(sectionId: string | null) {
  switch (sectionId) {
    case "hero":
      return { edge: 1.22, facet: 1.18, speed: 1.08, mouse: 1.08, accent: 0.34 };
    case "projects":
      return { edge: 0.92, facet: 0.86, speed: 0.98, mouse: 1.14, accent: 0.2 };
    case "about":
      return { edge: 0.96, facet: 0.9, speed: 0.96, mouse: 1, accent: 0.14 };
    case "contact":
      return { edge: 0.86, facet: 0.8, speed: 0.92, mouse: 0.92, accent: 0.18 };
    default:
      return { edge: 1, facet: 1, speed: 1, mouse: 1, accent: 0.12 };
  }
}

/* ── Spatial grid ── */
function buildGrid(particles: Particle[], w: number, h: number) {
  const cols = Math.ceil(w / GRID_CELL);
  const rows = Math.ceil(h / GRID_CELL);
  const grid: number[][] = new Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = [];
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const col = Math.min(Math.floor(p.x / GRID_CELL), cols - 1);
    const row = Math.min(Math.floor(p.y / GRID_CELL), rows - 1);
    grid[row * cols + col].push(i);
  }
  return { grid, cols, rows };
}

function getNeighborIndices(
  grid: number[][],
  cols: number,
  rows: number,
  col: number,
  row: number,
): number[] {
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const cell = grid[r * cols + c];
        for (let k = 0; k < cell.length; k++) result.push(cell[k]);
      }
    }
  }
  return result;
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let mouseX = -9999;
    let mouseY = -9999;
    let w = 0;
    let h = 0;
    let palette: Palette = {
      bg: "#000000",
      bgRgb: [0, 0, 0],
      fg: [255, 255, 255],
      fgDim: [136, 136, 136],
      accent: [164, 255, 68],
    };
    let hoveredSectionId: string | null = null;
    let scrollTarget = window.scrollY;
    let scrollCurrent = scrollTarget;
    let scrollVelocity = 0;

    const shockwaves: Shockwave[] = [];
    const particles: Particle[] = [];

    function updatePalette() {
      const rootStyle = getComputedStyle(document.documentElement);
      const bg = rootStyle.getPropertyValue("--bg").trim() || "#000000";
      const bgRgb = parseCssColor(bg);
      const fg = parseCssColor(rootStyle.getPropertyValue("--fg") || "#ffffff");
      const fgDim = parseCssColor(rootStyle.getPropertyValue("--fg-dim") || "#888888");
      const accent = parseCssColor(rootStyle.getPropertyValue("--accent") || "#a4ff44");
      palette = { bg, bgRgb, fg, fgDim, accent };
    }

    function initParticles() {
      particles.length = 0;
      let idx = 0;
      for (let depth = 0; depth < 3; depth++) {
        const count = LAYER_COUNTS[depth];
        const scale = DEPTH_SCALES[depth];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = BASE_SPEED * scale.speed;
          // 80% bright theme color, 20% dim theme color
          const color = idx % 5 === 0 ? palette.fgDim : palette.fg;
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: (0.5 + Math.random() * 0.7) * scale.radius,
            brightness: (0.5 + Math.random() * 0.5) * scale.brightness,
            color,
            phase: Math.random() * Math.PI * 2,
            depth,
          });
          idx++;
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas!.clientWidth * dpr;
      h = canvas!.clientHeight * dpr;
      canvas!.width = w;
      canvas!.height = h;
      if (particles.length === 0) initParticles();
    }
    updatePalette();
    resize();
    window.addEventListener("resize", resize);

    const themeObserver = new MutationObserver(() => {
      updatePalette();
      // Refresh particle palette without resetting positions.
      for (let i = 0; i < particles.length; i++) {
        particles[i].color = i % 5 === 0 ? palette.fgDim : palette.fg;
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    function onMouseMove(e: MouseEvent) {
      const dpr = Math.min(window.devicePixelRatio, 2);
      mouseX = e.clientX * dpr;
      mouseY = e.clientY * dpr;
      hoveredSectionId =
        (e.target instanceof Element && e.target.closest("section")?.id) || null;
    }
    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
      hoveredSectionId = null;
    }
    function onScroll() {
      scrollTarget = window.scrollY;
    }
    function onClick(e: MouseEvent) {
      const dpr = Math.min(window.devicePixelRatio, 2);
      if (shockwaves.length >= MAX_SHOCKWAVES) shockwaves.shift();
      shockwaves.push({
        x: e.clientX * dpr,
        y: e.clientY * dpr,
        time: (performance.now() - startTime) / 1000,
      });
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);

    function getLayerIndices(): [number[], number[], number[]] {
      const layers: [number[], number[], number[]] = [[], [], []];
      for (let i = 0; i < particles.length; i++) {
        layers[particles[i].depth].push(i);
      }
      return layers;
    }

    let raf: number;
    const startTime = performance.now();

    function getActiveSectionId() {
      const ids = ["hero", "projects", "about", "contact"];
      const probeY = window.innerHeight * 0.36;
      let bestId: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - probeY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = ids[i];
        }
      }

      return bestId;
    }

    function getHeroTitleCenter(dpr: number) {
      const title = document.querySelector(".hero-content__title");
      if (!(title instanceof HTMLElement)) return null;
      const rect = title.getBoundingClientRect();
      return {
        x: (rect.left + rect.width * 0.5) * dpr,
        y: (rect.top + rect.height * 0.5) * dpr,
        width: rect.width * dpr,
        height: rect.height * dpr,
      };
    }

    function render() {
      const now = performance.now();
      const t = (now - startTime) / 1000;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const activeSectionId = hoveredSectionId ?? getActiveSectionId();
      const sectionProfile = getSectionProfile(activeSectionId);
      const scrollForce = scrollTarget - scrollCurrent;
      scrollVelocity += scrollForce * 0.012;
      scrollVelocity *= 0.86;
      scrollCurrent += scrollVelocity;
      const scrollDelta = Math.max(-5, Math.min(5, scrollVelocity)) * dpr;
      const scaledMouseRadius = MOUSE_RADIUS * dpr;
      const scaledConnectDist = CONNECT_DIST * dpr;
      const distSq = scaledConnectDist * scaledConnectDist;
      const scaledFacetConnectDist = scaledConnectDist * FACET_CONNECT_DIST_MULTIPLIER;
      const facetDistSq = scaledFacetConnectDist * scaledFacetConnectDist;
      const heroTitle = getHeroTitleCenter(dpr);
      const isHeroActive = activeSectionId === "hero";

      /* Update shockwaves */
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        if (t - shockwaves[i].time > SHOCKWAVE_DURATION) {
          shockwaves.splice(i, 1);
        }
      }

      /* Update particles */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const scale = DEPTH_SCALES[p.depth];
        const motionBoost = sectionProfile.speed * (0.94 + p.depth * 0.08);

        p.x += (p.vx + Math.sin(t * 0.8 + p.phase) * WOBBLE_AMP * scale.wobble) * motionBoost;
        p.y +=
          (p.vy + Math.cos(t * 0.6 + p.phase * 1.3) * WOBBLE_AMP * scale.wobble) * motionBoost +
          scrollDelta * scale.scroll * -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < scaledMouseRadius && dist > 0) {
          const force =
            (1 - dist / scaledMouseRadius) *
            MOUSE_STRENGTH *
            dpr *
            scale.mouse *
            sectionProfile.mouse;
          p.x += dx * force;
          p.y += dy * force;
        }

        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const age = t - sw.time;
          const ringRadius = age * SHOCKWAVE_SPEED * dpr;
          const sdx = p.x - sw.x;
          const sdy = p.y - sw.y;
          const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
          const ringWidth = 80 * dpr;
          const distFromRing = Math.abs(sDist - ringRadius);
          if (distFromRing < ringWidth && sDist > 0) {
            const strength = (1 - distFromRing / ringWidth) * (1 - age / SHOCKWAVE_DURATION) * SHOCKWAVE_FORCE * dpr;
            p.x += (sdx / sDist) * strength;
            p.y += (sdy / sDist) * strength;
          }
        }

        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;
      }

      /* Clear */
      ctx!.fillStyle = palette.bg;
      ctx!.fillRect(0, 0, w, h);

      /* Spatial grid */
      const { grid, cols, rows } = buildGrid(particles, w, h);
      const layerIndices = getLayerIndices();

      /* Render each depth layer */
      for (let depth = 0; depth < 3; depth++) {
        const layerParticles = layerIndices[depth];
        const scale = DEPTH_SCALES[depth];

        const drawnPairs = new Set<number>();
        const drawnTriangles = new Set<string>();

        for (let li = 0; li < layerParticles.length; li++) {
          const i = layerParticles[li];
          const p = particles[i];
          const col = Math.min(Math.floor(p.x / GRID_CELL), cols - 1);
          const row = Math.min(Math.floor(p.y / GRID_CELL), rows - 1);
          const neighbors = getNeighborIndices(grid, cols, rows, col, row);
          const closeNeighbors: number[] = [];
          const closeNeighborDistSq = new Map<number, number>();

          /* Edge lines */
          for (let n = 0; n < neighbors.length; n++) {
            const j = neighbors[n];
            if (j <= i || particles[j].depth !== depth) continue;

            const key = i * PARTICLE_COUNT + j;
            if (drawnPairs.has(key)) continue;
            drawnPairs.add(key);

            const q = particles[j];
            const ddx = p.x - q.x;
            const ddy = p.y - q.y;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 > distSq) continue;
            closeNeighbors.push(j);
            closeNeighborDistSq.set(j, d2);

            const d = Math.sqrt(d2);
            const midX = (p.x + q.x) * 0.5;
            const midY = (p.y + q.y) * 0.5;
            const cursorBoost =
              mouseX > 0 && mouseY > 0
                ? clamp01(1 - Math.hypot(mouseX - midX, mouseY - midY) / (scaledMouseRadius * 1.05))
                : 0;
            const heroBoost =
              heroTitle && isHeroActive
                ? clamp01(1 - Math.hypot(heroTitle.x - midX, heroTitle.y - midY) / (HERO_ZONE_RADIUS * dpr))
                : 0;
            const accentMix = Math.max(cursorBoost * 0.42, heroBoost * HERO_TITLE_BOOST);
            const alpha =
              (1 - d / scaledConnectDist) *
              EDGE_ALPHA *
              scale.brightness *
              sectionProfile.edge *
              (1 + heroBoost * 0.45);
            const edgeColor = mixColor(palette.fg, palette.accent, accentMix + sectionProfile.accent);

            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = rgba(edgeColor, alpha);
            ctx!.lineWidth = EDGE_WIDTH;
            ctx!.stroke();
          }

          /* Subtle filled facets for stronger low-poly read */
          for (let a = 0; a < closeNeighbors.length; a++) {
            const j = closeNeighbors[a];
            const q = particles[j];
            const qCol = Math.min(Math.floor(q.x / GRID_CELL), cols - 1);
            const qRow = Math.min(Math.floor(q.y / GRID_CELL), rows - 1);
            const qNeighbors = getNeighborIndices(grid, cols, rows, qCol, qRow);

            for (let b = a + 1; b < closeNeighbors.length; b++) {
              const k = closeNeighbors[b];
              if (k === j) continue;
              if (!qNeighbors.includes(k)) continue;
              if (particles[k].depth !== depth) continue;

              const tri = [i, j, k].sort((m, n) => m - n).join("-");
              if (drawnTriangles.has(tri)) continue;
              drawnTriangles.add(tri);

              const r = particles[k];
              const dpq2 = closeNeighborDistSq.get(j);
              const dpr2 = closeNeighborDistSq.get(k);
              if (dpq2 === undefined || dpr2 === undefined) continue;
              const jqx = q.x - r.x;
              const jqy = q.y - r.y;
              const dqr2 = jqx * jqx + jqy * jqy;
              if (dqr2 > facetDistSq) continue;

              ctx!.beginPath();
              ctx!.moveTo(p.x, p.y);
              ctx!.lineTo(q.x, q.y);
              ctx!.lineTo(r.x, r.y);
              ctx!.closePath();

              // Smoothly fade facets near the edge distance threshold to avoid popping.
              const maxEdgeRatio =
                Math.sqrt(Math.max(dpq2, dpr2, dqr2)) / scaledFacetConnectDist;
              const edgeFade = 1 - smoothstep(FACET_EDGE_FADE_START, 1, maxEdgeRatio);
              const heroFacetBoost =
                heroTitle && isHeroActive
                  ? clamp01(
                      1 -
                        Math.hypot(
                          heroTitle.x - (p.x + q.x + r.x) / 3,
                          heroTitle.y - (p.y + q.y + r.y) / 3,
                        ) /
                          (HERO_ZONE_RADIUS * 1.15 * dpr),
                    )
                  : 0;
              const facetAlpha =
                FACET_ALPHA *
                scale.brightness *
                edgeFade *
                sectionProfile.facet *
                (1 + heroFacetBoost * 0.55);
              if (facetAlpha <= 0) continue;

              const facetColor = mixColor(
                palette.fg,
                palette.fgDim,
                FACET_COLOR_BLEND + heroFacetBoost * 0.08,
              );
              ctx!.fillStyle = rgba(
                facetColor,
                facetAlpha,
              );
              ctx!.fill();
            }
          }
        }

        /* Particle dots */
        for (let li = 0; li < layerParticles.length; li++) {
          const i = layerParticles[li];
          const p = particles[i];
          const pulse = 1 + 0.15 * Math.sin(t * 2 + p.phase);
          const r = p.radius * pulse * dpr;
          const heroParticleBoost =
            heroTitle && isHeroActive
              ? clamp01(1 - Math.hypot(heroTitle.x - p.x, heroTitle.y - p.y) / (HERO_ZONE_RADIUS * dpr))
              : 0;
          const [cr, cg, cb] = mixColor(
            p.color as [number, number, number],
            palette.accent,
            sectionProfile.accent * 0.2 + heroParticleBoost * 0.24,
          );
          const a = p.brightness * (0.6 + 0.4 * Math.sin(t * 1.5 + p.phase));

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx!.fill();
        }
      }

      /* Scanlines */
      ctx!.fillStyle = rgba(palette.fg, SCANLINE_ALPHA);
      for (let sy = 0; sy < h; sy += 4) {
        ctx!.fillRect(0, sy, w, 1);
      }

      /* Mouse glow */
      if (mouseX > 0 && mouseY > 0) {
        const mgr = scaledMouseRadius * 1.2;
        const mg = ctx!.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mgr);
        mg.addColorStop(0, rgba(mixColor(palette.fg, palette.accent, 0.42), 0.05));
        mg.addColorStop(0.45, rgba(palette.fg, 0.015));
        mg.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, mgr, 0, Math.PI * 2);
        ctx!.fillStyle = mg;
        ctx!.fill();
      }

      /* Harder shockwave rings */
      for (let i = 0; i < shockwaves.length; i++) {
        const age = t - shockwaves[i].time;
        const progress = clamp01(age / SHOCKWAVE_DURATION);
        const radius = progress * SHOCKWAVE_SPEED * dpr;
        const alpha = (1 - progress) * SHOCKWAVE_DRAW_ALPHA;

        ctx!.beginPath();
        ctx!.arc(shockwaves[i].x, shockwaves[i].y, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = rgba(palette.accent, alpha);
        ctx!.lineWidth = SHOCKWAVE_DRAW_WIDTH * dpr;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(shockwaves[i].x, shockwaves[i].y, Math.max(0, radius - 14 * dpr), 0, Math.PI * 2);
        ctx!.strokeStyle = rgba(palette.fg, alpha * 0.6);
        ctx!.lineWidth = Math.max(1, dpr);
        ctx!.stroke();
      }

      /* Vignette */
      const vx = w / 2;
      const vy = h / 2;
      const vRad = Math.max(w, h) * 0.7;
      const vg = ctx!.createRadialGradient(vx, vy, vRad * 0.4, vx, vy, vRad);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, rgba(palette.bgRgb, VIGNETTE_ALPHA));
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
}
