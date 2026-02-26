import { useEffect, useRef } from "react";

/* ── Palette ── */
const BG = "#000000";
const WHITE = [255, 255, 255] as const;
const GRAY = [136, 136, 136] as const;

/* ── Tunables ── */
const PARTICLE_COUNT = 120;
const CONNECT_DIST = 150;
const MOUSE_RADIUS = 200;
const MOUSE_STRENGTH = 0.012;
const BASE_SPEED = 0.15;
const WOBBLE_AMP = 0.1;
const GRID_CELL = CONNECT_DIST;

/* ── Depth layers ── */
const LAYER_COUNTS = [45, 45, 30];
const DEPTH_SCALES = [
  { radius: 0.4, speed: 0.4, brightness: 0.4, wobble: 0.3, mouse: 0.2 },
  { radius: 0.7, speed: 0.7, brightness: 0.7, wobble: 0.7, mouse: 0.6 },
  { radius: 1.0, speed: 1.0, brightness: 1.0, wobble: 1.0, mouse: 1.0 },
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

    const shockwaves: Shockwave[] = [];
    const particles: Particle[] = [];

    function initParticles() {
      particles.length = 0;
      let idx = 0;
      for (let depth = 0; depth < 3; depth++) {
        const count = LAYER_COUNTS[depth];
        const scale = DEPTH_SCALES[depth];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = BASE_SPEED * scale.speed;
          // 80% white, 20% gray
          const color = idx % 5 === 0 ? GRAY : WHITE;
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
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      const dpr = Math.min(window.devicePixelRatio, 2);
      mouseX = e.clientX * dpr;
      mouseY = e.clientY * dpr;
    }
    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
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

    function render() {
      const now = performance.now();
      const t = (now - startTime) / 1000;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const scaledMouseRadius = MOUSE_RADIUS * dpr;
      const scaledConnectDist = CONNECT_DIST * dpr;
      const distSq = scaledConnectDist * scaledConnectDist;

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

        p.x += p.vx + Math.sin(t * 0.8 + p.phase) * WOBBLE_AMP * scale.wobble;
        p.y += p.vy + Math.cos(t * 0.6 + p.phase * 1.3) * WOBBLE_AMP * scale.wobble;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < scaledMouseRadius && dist > 0) {
          const force = (1 - dist / scaledMouseRadius) * MOUSE_STRENGTH * dpr * scale.mouse;
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
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, w, h);

      /* Spatial grid */
      const { grid, cols, rows } = buildGrid(particles, w, h);
      const layerIndices = getLayerIndices();

      /* Render each depth layer */
      for (let depth = 0; depth < 3; depth++) {
        const layerParticles = layerIndices[depth];
        const scale = DEPTH_SCALES[depth];

        const drawnPairs = new Set<number>();

        for (let li = 0; li < layerParticles.length; li++) {
          const i = layerParticles[li];
          const p = particles[i];
          const col = Math.min(Math.floor(p.x / GRID_CELL), cols - 1);
          const row = Math.min(Math.floor(p.y / GRID_CELL), rows - 1);
          const neighbors = getNeighborIndices(grid, cols, rows, col, row);

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

            const d = Math.sqrt(d2);
            const alpha = (1 - d / scaledConnectDist) * 0.06 * scale.brightness;

            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }

        /* Particle dots */
        for (let li = 0; li < layerParticles.length; li++) {
          const i = layerParticles[li];
          const p = particles[i];
          const pulse = 1 + 0.15 * Math.sin(t * 2 + p.phase);
          const r = p.radius * pulse * dpr;
          const [cr, cg, cb] = p.color;
          const a = p.brightness * (0.6 + 0.4 * Math.sin(t * 1.5 + p.phase));

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx!.fill();
        }
      }

      /* Scanlines */
      ctx!.fillStyle = `rgba(255,255,255,0.03)`;
      for (let sy = 0; sy < h; sy += 4) {
        ctx!.fillRect(0, sy, w, 1);
      }

      /* Mouse glow */
      if (mouseX > 0 && mouseY > 0) {
        const mgr = scaledMouseRadius * 1.2;
        const mg = ctx!.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mgr);
        mg.addColorStop(0, "rgba(255,255,255,0.04)");
        mg.addColorStop(0.5, "rgba(255,255,255,0.015)");
        mg.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.beginPath();
        ctx!.arc(mouseX, mouseY, mgr, 0, Math.PI * 2);
        ctx!.fillStyle = mg;
        ctx!.fill();
      }

      /* Vignette */
      const vx = w / 2;
      const vy = h / 2;
      const vRad = Math.max(w, h) * 0.7;
      const vg = ctx!.createRadialGradient(vx, vy, vRad * 0.4, vx, vy, vRad);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.6)");
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
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
}
