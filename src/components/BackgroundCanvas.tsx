import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 120;
const CONNECT_DIST = 150;
const MOUSE_RADIUS = 200;
const MOUSE_STRENGTH = 0.0075;
const BASE_SPEED = 0.15;
const WOBBLE_AMP = 0.1;
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
const SHOCKWAVE_SPEED = 600;
const SHOCKWAVE_FORCE = 8;
const SHOCKWAVE_DURATION = 1.5;
const MAX_SHOCKWAVES = 3;
const RING_SEGMENTS = 52;

const LAYER_COUNTS = [45, 45, 30];
const DEPTH_SCALES = [
  { radius: 0.3, speed: 0.26, brightness: 0.26, wobble: 0.18, mouse: 0.14, scroll: 0.03 },
  { radius: 0.68, speed: 0.62, brightness: 0.68, wobble: 0.58, mouse: 0.54, scroll: 0.08 },
  { radius: 1.08, speed: 1.12, brightness: 1.08, wobble: 1.08, mouse: 1.08, scroll: 0.16 },
] as const;

type Rgb = readonly [number, number, number];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  brightness: number;
  color: Rgb;
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
  bgRgb: Rgb;
  fg: Rgb;
  fgDim: Rgb;
  accent: Rgb;
}

interface MeshProgramInfo {
  program: WebGLProgram;
  attribPosition: number;
  attribColor: number;
  uniformResolution: WebGLUniformLocation;
}

interface PointProgramInfo {
  program: WebGLProgram;
  attribPosition: number;
  attribSize: number;
  attribColor: number;
  uniformResolution: WebGLUniformLocation;
}

interface RadialProgramInfo {
  program: WebGLProgram;
  attribPosition: number;
  uniformResolution: WebGLUniformLocation;
  uniformCenter: WebGLUniformLocation;
  uniformRadius: WebGLUniformLocation;
  uniformInnerColor: WebGLUniformLocation;
  uniformMidColor: WebGLUniformLocation;
  uniformOuterColor: WebGLUniformLocation;
  uniformMidStop: WebGLUniformLocation;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function parseCssColor(value: string): Rgb {
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

function mixColor(source: Rgb, target: Rgb, amount: number): [number, number, number] {
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

function buildGrid(particles: Particle[], w: number, h: number, cellSize: number) {
  const safeCellSize = Math.max(1, cellSize);
  const cols = Math.max(1, Math.ceil(w / safeCellSize));
  const rows = Math.max(1, Math.ceil(h / safeCellSize));
  const grid: number[][] = new Array(cols * rows);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = [];
  }
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const col = Math.min(Math.floor(particle.x / safeCellSize), cols - 1);
    const row = Math.min(Math.floor(particle.y / safeCellSize), rows - 1);
    grid[row * cols + col].push(i);
  }
  return { grid, cols, rows, cellSize: safeCellSize };
}

function getNeighborIndices(
  grid: number[][],
  cols: number,
  rows: number,
  col: number,
  row: number,
) {
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        const cell = grid[nextRow * cols + nextCol];
        for (let i = 0; i < cell.length; i++) {
          result.push(cell[i]);
        }
      }
    }
  }
  return result;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Unable to create WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader compile failure.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Unable to create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown WebGL link failure.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function getUniformLocation(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
) {
  const location = gl.getUniformLocation(program, name);
  if (!location) {
    throw new Error(`Missing uniform: ${name}`);
  }
  return location;
}

function createMeshProgram(gl: WebGLRenderingContext): MeshProgramInfo {
  const program = createProgram(
    gl,
    `
      attribute vec2 a_position;
      attribute vec4 a_color;
      uniform vec2 u_resolution;
      varying vec4 v_color;

      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 clipSpace = zeroToOne * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        v_color = a_color;
      }
    `,
    `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        gl_FragColor = v_color;
      }
    `,
  );

  return {
    program,
    attribPosition: gl.getAttribLocation(program, "a_position"),
    attribColor: gl.getAttribLocation(program, "a_color"),
    uniformResolution: getUniformLocation(gl, program, "u_resolution"),
  };
}

function createPointProgram(gl: WebGLRenderingContext): PointProgramInfo {
  const program = createProgram(
    gl,
    `
      attribute vec2 a_position;
      attribute float a_size;
      attribute vec4 a_color;
      uniform vec2 u_resolution;
      varying vec4 v_color;

      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 clipSpace = zeroToOne * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        gl_PointSize = a_size;
        v_color = a_color;
      }
    `,
    `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        vec2 pointUv = gl_PointCoord * 2.0 - 1.0;
        float distSq = dot(pointUv, pointUv);
        if (distSq > 1.0) {
          discard;
        }

        float edgeFade = 1.0 - smoothstep(0.55, 1.0, distSq);
        float coreBoost = 0.22 * (1.0 - smoothstep(0.0, 0.35, distSq));
        float alpha = v_color.a * clamp(edgeFade + coreBoost, 0.0, 1.0);
        gl_FragColor = vec4(v_color.rgb, alpha);
      }
    `,
  );

  return {
    program,
    attribPosition: gl.getAttribLocation(program, "a_position"),
    attribSize: gl.getAttribLocation(program, "a_size"),
    attribColor: gl.getAttribLocation(program, "a_color"),
    uniformResolution: getUniformLocation(gl, program, "u_resolution"),
  };
}

function createRadialProgram(gl: WebGLRenderingContext): RadialProgramInfo {
  const program = createProgram(
    gl,
    `
      attribute vec2 a_position;
      uniform vec2 u_resolution;
      varying vec2 v_position;

      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 clipSpace = zeroToOne * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        v_position = a_position;
      }
    `,
    `
      precision mediump float;
      varying vec2 v_position;
      uniform vec2 u_center;
      uniform float u_radius;
      uniform vec4 u_innerColor;
      uniform vec4 u_midColor;
      uniform vec4 u_outerColor;
      uniform float u_midStop;

      void main() {
        float radius = max(u_radius, 0.0001);
        float distanceRatio = clamp(distance(v_position, u_center) / radius, 0.0, 1.0);
        vec4 color = distanceRatio < u_midStop
          ? mix(u_innerColor, u_midColor, smoothstep(0.0, u_midStop, distanceRatio))
          : mix(u_midColor, u_outerColor, smoothstep(u_midStop, 1.0, distanceRatio));
        gl_FragColor = color;
      }
    `,
  );

  return {
    program,
    attribPosition: gl.getAttribLocation(program, "a_position"),
    uniformResolution: getUniformLocation(gl, program, "u_resolution"),
    uniformCenter: getUniformLocation(gl, program, "u_center"),
    uniformRadius: getUniformLocation(gl, program, "u_radius"),
    uniformInnerColor: getUniformLocation(gl, program, "u_innerColor"),
    uniformMidColor: getUniformLocation(gl, program, "u_midColor"),
    uniformOuterColor: getUniformLocation(gl, program, "u_outerColor"),
    uniformMidStop: getUniformLocation(gl, program, "u_midStop"),
  };
}

function pushColorVertex(
  target: number[],
  x: number,
  y: number,
  color: Rgb,
  alpha: number,
) {
  target.push(x, y, color[0] / 255, color[1] / 255, color[2] / 255, clamp01(alpha));
}

function pushQuadPositions(
  target: number[],
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  target.push(
    left,
    top,
    right,
    top,
    right,
    bottom,
    left,
    top,
    right,
    bottom,
    left,
    bottom,
  );
}

function pushLineQuad(
  target: number[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
  width: number,
  color: Rgb,
  alpha: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  if (length <= 0.0001) {
    return;
  }

  const halfWidth = width * 0.5;
  const nx = (-dy / length) * halfWidth;
  const ny = (dx / length) * halfWidth;

  const v1x = ax + nx;
  const v1y = ay + ny;
  const v2x = ax - nx;
  const v2y = ay - ny;
  const v3x = bx - nx;
  const v3y = by - ny;
  const v4x = bx + nx;
  const v4y = by + ny;

  pushColorVertex(target, v1x, v1y, color, alpha);
  pushColorVertex(target, v2x, v2y, color, alpha);
  pushColorVertex(target, v3x, v3y, color, alpha);

  pushColorVertex(target, v1x, v1y, color, alpha);
  pushColorVertex(target, v3x, v3y, color, alpha);
  pushColorVertex(target, v4x, v4y, color, alpha);
}

function pushRing(
  target: number[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  color: Rgb,
  alpha: number,
) {
  if (outerRadius <= 0 || outerRadius <= innerRadius) {
    return;
  }

  for (let i = 0; i < RING_SEGMENTS; i++) {
    const t0 = (i / RING_SEGMENTS) * Math.PI * 2;
    const t1 = ((i + 1) / RING_SEGMENTS) * Math.PI * 2;
    const cos0 = Math.cos(t0);
    const sin0 = Math.sin(t0);
    const cos1 = Math.cos(t1);
    const sin1 = Math.sin(t1);

    const outer0x = centerX + cos0 * outerRadius;
    const outer0y = centerY + sin0 * outerRadius;
    const inner0x = centerX + cos0 * innerRadius;
    const inner0y = centerY + sin0 * innerRadius;
    const outer1x = centerX + cos1 * outerRadius;
    const outer1y = centerY + sin1 * outerRadius;
    const inner1x = centerX + cos1 * innerRadius;
    const inner1y = centerY + sin1 * innerRadius;

    pushColorVertex(target, outer0x, outer0y, color, alpha);
    pushColorVertex(target, inner0x, inner0y, color, alpha);
    pushColorVertex(target, inner1x, inner1y, color, alpha);

    pushColorVertex(target, outer0x, outer0y, color, alpha);
    pushColorVertex(target, inner1x, inner1y, color, alpha);
    pushColorVertex(target, outer1x, outer1y, color, alpha);
  }
}

function colorToVec4(color: Rgb, alpha: number): [number, number, number, number] {
  return [color[0] / 255, color[1] / 255, color[2] / 255, clamp01(alpha)];
}

function drawMesh(
  gl: WebGLRenderingContext,
  programInfo: MeshProgramInfo,
  buffer: WebGLBuffer,
  resolutionWidth: number,
  resolutionHeight: number,
  data: number[],
) {
  if (data.length === 0) {
    return;
  }

  gl.useProgram(programInfo.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

  gl.enableVertexAttribArray(programInfo.attribPosition);
  gl.vertexAttribPointer(programInfo.attribPosition, 2, gl.FLOAT, false, 24, 0);

  gl.enableVertexAttribArray(programInfo.attribColor);
  gl.vertexAttribPointer(programInfo.attribColor, 4, gl.FLOAT, false, 24, 8);

  gl.uniform2f(programInfo.uniformResolution, resolutionWidth, resolutionHeight);
  gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
}

function drawPoints(
  gl: WebGLRenderingContext,
  programInfo: PointProgramInfo,
  buffer: WebGLBuffer,
  resolutionWidth: number,
  resolutionHeight: number,
  data: number[],
) {
  if (data.length === 0) {
    return;
  }

  gl.useProgram(programInfo.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

  gl.enableVertexAttribArray(programInfo.attribPosition);
  gl.vertexAttribPointer(programInfo.attribPosition, 2, gl.FLOAT, false, 28, 0);

  gl.enableVertexAttribArray(programInfo.attribSize);
  gl.vertexAttribPointer(programInfo.attribSize, 1, gl.FLOAT, false, 28, 8);

  gl.enableVertexAttribArray(programInfo.attribColor);
  gl.vertexAttribPointer(programInfo.attribColor, 4, gl.FLOAT, false, 28, 12);

  gl.uniform2f(programInfo.uniformResolution, resolutionWidth, resolutionHeight);
  gl.drawArrays(gl.POINTS, 0, data.length / 7);
}

function drawRadial(
  gl: WebGLRenderingContext,
  programInfo: RadialProgramInfo,
  buffer: WebGLBuffer,
  resolutionWidth: number,
  resolutionHeight: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  centerX: number,
  centerY: number,
  radius: number,
  innerColor: [number, number, number, number],
  midColor: [number, number, number, number],
  outerColor: [number, number, number, number],
  midStop: number,
) {
  const vertices: number[] = [];
  pushQuadPositions(vertices, left, top, right, bottom);

  gl.useProgram(programInfo.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.enableVertexAttribArray(programInfo.attribPosition);
  gl.vertexAttribPointer(programInfo.attribPosition, 2, gl.FLOAT, false, 8, 0);

  gl.uniform2f(programInfo.uniformResolution, resolutionWidth, resolutionHeight);
  gl.uniform2f(programInfo.uniformCenter, centerX, centerY);
  gl.uniform1f(programInfo.uniformRadius, radius);
  gl.uniform4f(programInfo.uniformInnerColor, ...innerColor);
  gl.uniform4f(programInfo.uniformMidColor, ...midColor);
  gl.uniform4f(programInfo.uniformOuterColor, ...outerColor);
  gl.uniform1f(programInfo.uniformMidStop, clamp01(midStop));

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      return;
    }

    const canvasElement = canvas;
    const glContext = gl;

    let meshProgram: MeshProgramInfo;
    let pointProgram: PointProgramInfo;
    let radialProgram: RadialProgramInfo;
    let meshBuffer: WebGLBuffer;
    let pointBuffer: WebGLBuffer;
    let radialBuffer: WebGLBuffer;

    try {
      meshProgram = createMeshProgram(glContext);
      pointProgram = createPointProgram(glContext);
      radialProgram = createRadialProgram(glContext);

      const createdMeshBuffer = glContext.createBuffer();
      const createdPointBuffer = glContext.createBuffer();
      const createdRadialBuffer = glContext.createBuffer();

      if (!createdMeshBuffer || !createdPointBuffer || !createdRadialBuffer) {
        throw new Error("Unable to create WebGL buffers.");
      }

      meshBuffer = createdMeshBuffer;
      pointBuffer = createdPointBuffer;
      radialBuffer = createdRadialBuffer;
    } catch (error) {
      console.error("Failed to initialize background WebGL renderer.", error);
      return;
    }

    glContext.disable(glContext.DEPTH_TEST);
    glContext.enable(glContext.BLEND);
    glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);

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
    let raf = 0;

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
      canvasElement.style.backgroundColor = bg;
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
      w = Math.max(1, Math.floor(canvasElement.clientWidth * dpr));
      h = Math.max(1, Math.floor(canvasElement.clientHeight * dpr));
      canvasElement.width = w;
      canvasElement.height = h;
      glContext.viewport(0, 0, w, h);

      if (particles.length === 0) {
        initParticles();
      }
    }

    function onMouseMove(event: MouseEvent) {
      const dpr = Math.min(window.devicePixelRatio, 2);
      mouseX = event.clientX * dpr;
      mouseY = event.clientY * dpr;
      hoveredSectionId =
        (event.target instanceof Element && event.target.closest("section")?.id) || null;
    }

    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
      hoveredSectionId = null;
    }

    function onScroll() {
      scrollTarget = window.scrollY;
    }

    function onClick(event: MouseEvent) {
      const dpr = Math.min(window.devicePixelRatio, 2);
      if (shockwaves.length >= MAX_SHOCKWAVES) {
        shockwaves.shift();
      }
      shockwaves.push({
        x: event.clientX * dpr,
        y: event.clientY * dpr,
        time: (performance.now() - startTime) / 1000,
      });
    }

    function getLayerIndices(): [number[], number[], number[]] {
      const layers: [number[], number[], number[]] = [[], [], []];
      for (let i = 0; i < particles.length; i++) {
        layers[particles[i].depth].push(i);
      }
      return layers;
    }

    function getActiveSectionId() {
      const ids = ["hero", "projects", "about", "contact"];
      const probeY = window.innerHeight * 0.36;
      let bestId: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < ids.length; i++) {
        const element = document.getElementById(ids[i]);
        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          continue;
        }

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
      if (!(title instanceof HTMLElement)) {
        return null;
      }

      const rect = title.getBoundingClientRect();
      return {
        x: (rect.left + rect.width * 0.5) * dpr,
        y: (rect.top + rect.height * 0.5) * dpr,
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
      const connectDistSq = scaledConnectDist * scaledConnectDist;
      const scaledFacetConnectDist = scaledConnectDist * FACET_CONNECT_DIST_MULTIPLIER;
      const facetDistSq = scaledFacetConnectDist * scaledFacetConnectDist;
      const heroTitle = getHeroTitleCenter(dpr);
      const isHeroActive = activeSectionId === "hero";
      const lineWidth = Math.max(1, EDGE_WIDTH * dpr);
      const gridCell = scaledConnectDist;

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        if (t - shockwaves[i].time > SHOCKWAVE_DURATION) {
          shockwaves.splice(i, 1);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const scale = DEPTH_SCALES[particle.depth];
        const motionBoost = sectionProfile.speed * (0.94 + particle.depth * 0.08);

        particle.x +=
          (particle.vx + Math.sin(t * 0.8 + particle.phase) * WOBBLE_AMP * scale.wobble) *
          motionBoost;
        particle.y +=
          (particle.vy +
            Math.cos(t * 0.6 + particle.phase * 1.3) * WOBBLE_AMP * scale.wobble) *
            motionBoost +
          scrollDelta * scale.scroll * -1;

        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < scaledMouseRadius && dist > 0) {
          const force =
            (1 - dist / scaledMouseRadius) *
            MOUSE_STRENGTH *
            dpr *
            scale.mouse *
            sectionProfile.mouse;
          particle.x += dx * force;
          particle.y += dy * force;
        }

        for (let s = 0; s < shockwaves.length; s++) {
          const shockwave = shockwaves[s];
          const age = t - shockwave.time;
          const ringRadius = age * SHOCKWAVE_SPEED * dpr;
          const sdx = particle.x - shockwave.x;
          const sdy = particle.y - shockwave.y;
          const shockDist = Math.sqrt(sdx * sdx + sdy * sdy);
          const ringWidth = 80 * dpr;
          const distFromRing = Math.abs(shockDist - ringRadius);

          if (distFromRing < ringWidth && shockDist > 0) {
            const strength =
              (1 - distFromRing / ringWidth) *
              (1 - age / SHOCKWAVE_DURATION) *
              SHOCKWAVE_FORCE *
              dpr;
            particle.x += (sdx / shockDist) * strength;
            particle.y += (sdy / shockDist) * strength;
          }
        }

        if (particle.x < 0) {
          particle.x += w;
        } else if (particle.x > w) {
          particle.x -= w;
        }

        if (particle.y < 0) {
          particle.y += h;
        } else if (particle.y > h) {
          particle.y -= h;
        }
      }

      glContext.clearColor(
        palette.bgRgb[0] / 255,
        palette.bgRgb[1] / 255,
        palette.bgRgb[2] / 255,
        1,
      );
      glContext.clear(glContext.COLOR_BUFFER_BIT);

      const facetVertices: number[] = [];
      const lineVertices: number[] = [];
      const particleVertices: number[] = [];
      const scanlineVertices: number[] = [];
      const shockwaveVertices: number[] = [];

      const { grid, cols, rows, cellSize } = buildGrid(particles, w, h, gridCell);
      const layerIndices = getLayerIndices();

      for (let depth = 0; depth < 3; depth++) {
        const layerParticles = layerIndices[depth];
        const scale = DEPTH_SCALES[depth];
        const drawnPairs = new Set<number>();
        const drawnTriangles = new Set<string>();

        for (let li = 0; li < layerParticles.length; li++) {
          const i = layerParticles[li];
          const particle = particles[i];
          const col = Math.min(Math.floor(particle.x / cellSize), cols - 1);
          const row = Math.min(Math.floor(particle.y / cellSize), rows - 1);
          const neighbors = getNeighborIndices(grid, cols, rows, col, row);
          const closeNeighbors: number[] = [];
          const closeNeighborDistSq = new Map<number, number>();

          for (let n = 0; n < neighbors.length; n++) {
            const j = neighbors[n];
            if (j <= i || particles[j].depth !== depth) {
              continue;
            }

            const key = i * PARTICLE_COUNT + j;
            if (drawnPairs.has(key)) {
              continue;
            }
            drawnPairs.add(key);

            const other = particles[j];
            const ddx = particle.x - other.x;
            const ddy = particle.y - other.y;
            const distSq = ddx * ddx + ddy * ddy;
            if (distSq > connectDistSq) {
              continue;
            }

            closeNeighbors.push(j);
            closeNeighborDistSq.set(j, distSq);

            const distance = Math.sqrt(distSq);
            const midX = (particle.x + other.x) * 0.5;
            const midY = (particle.y + other.y) * 0.5;
            const cursorBoost =
              mouseX > 0 && mouseY > 0
                ? clamp01(1 - Math.hypot(mouseX - midX, mouseY - midY) / (scaledMouseRadius * 1.05))
                : 0;
            const heroBoost =
              heroTitle && isHeroActive
                ? clamp01(
                    1 - Math.hypot(heroTitle.x - midX, heroTitle.y - midY) / (HERO_ZONE_RADIUS * dpr),
                  )
                : 0;
            const accentMix = Math.max(cursorBoost * 0.42, heroBoost * HERO_TITLE_BOOST);
            const alpha =
              (1 - distance / scaledConnectDist) *
              EDGE_ALPHA *
              scale.brightness *
              sectionProfile.edge *
              (1 + heroBoost * 0.45);
            const edgeColor = mixColor(palette.fg, palette.accent, accentMix + sectionProfile.accent);

            pushLineQuad(
              lineVertices,
              particle.x,
              particle.y,
              other.x,
              other.y,
              lineWidth,
              edgeColor,
              alpha,
            );
          }

          for (let a = 0; a < closeNeighbors.length; a++) {
            const j = closeNeighbors[a];
            const other = particles[j];
            const otherCol = Math.min(Math.floor(other.x / cellSize), cols - 1);
            const otherRow = Math.min(Math.floor(other.y / cellSize), rows - 1);
            const otherNeighbors = getNeighborIndices(grid, cols, rows, otherCol, otherRow);

            for (let b = a + 1; b < closeNeighbors.length; b++) {
              const k = closeNeighbors[b];
              if (k === j || !otherNeighbors.includes(k) || particles[k].depth !== depth) {
                continue;
              }

              const triangleKey = [i, j, k].sort((m, n) => m - n).join("-");
              if (drawnTriangles.has(triangleKey)) {
                continue;
              }
              drawnTriangles.add(triangleKey);

              const third = particles[k];
              const distPqSq = closeNeighborDistSq.get(j);
              const distPrSq = closeNeighborDistSq.get(k);
              if (distPqSq === undefined || distPrSq === undefined) {
                continue;
              }

              const qrx = other.x - third.x;
              const qry = other.y - third.y;
              const distQrSq = qrx * qrx + qry * qry;
              if (distQrSq > facetDistSq) {
                continue;
              }

              const maxEdgeRatio =
                Math.sqrt(Math.max(distPqSq, distPrSq, distQrSq)) / scaledFacetConnectDist;
              const edgeFade = 1 - smoothstep(FACET_EDGE_FADE_START, 1, maxEdgeRatio);
              const heroFacetBoost =
                heroTitle && isHeroActive
                  ? clamp01(
                      1 -
                        Math.hypot(
                          heroTitle.x - (particle.x + other.x + third.x) / 3,
                          heroTitle.y - (particle.y + other.y + third.y) / 3,
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
              if (facetAlpha <= 0) {
                continue;
              }

              const facetColor = mixColor(
                palette.fg,
                palette.fgDim,
                FACET_COLOR_BLEND + heroFacetBoost * 0.08,
              );

              pushColorVertex(facetVertices, particle.x, particle.y, facetColor, facetAlpha);
              pushColorVertex(facetVertices, other.x, other.y, facetColor, facetAlpha);
              pushColorVertex(facetVertices, third.x, third.y, facetColor, facetAlpha);
            }
          }
        }

        for (let li = 0; li < layerParticles.length; li++) {
          const particle = particles[layerParticles[li]];
          const pulse = 1 + 0.15 * Math.sin(t * 2 + particle.phase);
          const size = Math.max(2, particle.radius * pulse * dpr * 2.6);
          const heroParticleBoost =
            heroTitle && isHeroActive
              ? clamp01(
                  1 - Math.hypot(heroTitle.x - particle.x, heroTitle.y - particle.y) / (HERO_ZONE_RADIUS * dpr),
                )
              : 0;
          const particleColor = mixColor(
            particle.color,
            palette.accent,
            sectionProfile.accent * 0.2 + heroParticleBoost * 0.24,
          );
          const alpha =
            particle.brightness * (0.6 + 0.4 * Math.sin(t * 1.5 + particle.phase));

          particleVertices.push(
            particle.x,
            particle.y,
            size,
            particleColor[0] / 255,
            particleColor[1] / 255,
            particleColor[2] / 255,
            clamp01(alpha),
          );
        }
      }

      for (let scanY = 0; scanY < h; scanY += 4) {
        const nextY = Math.min(h, scanY + 1);
        pushColorVertex(scanlineVertices, 0, scanY, palette.fg, SCANLINE_ALPHA);
        pushColorVertex(scanlineVertices, w, scanY, palette.fg, SCANLINE_ALPHA);
        pushColorVertex(scanlineVertices, w, nextY, palette.fg, SCANLINE_ALPHA);

        pushColorVertex(scanlineVertices, 0, scanY, palette.fg, SCANLINE_ALPHA);
        pushColorVertex(scanlineVertices, w, nextY, palette.fg, SCANLINE_ALPHA);
        pushColorVertex(scanlineVertices, 0, nextY, palette.fg, SCANLINE_ALPHA);
      }

      for (let i = 0; i < shockwaves.length; i++) {
        const age = t - shockwaves[i].time;
        const progress = clamp01(age / SHOCKWAVE_DURATION);
        const radius = progress * SHOCKWAVE_SPEED * dpr;
        const alpha = (1 - progress) * SHOCKWAVE_DRAW_ALPHA;
        const outerRadius = radius + SHOCKWAVE_DRAW_WIDTH * dpr;
        const innerRadius = Math.max(0, radius - SHOCKWAVE_DRAW_WIDTH * dpr);
        const innerHighlightOuter = Math.max(0, radius - 13 * dpr);
        const innerHighlightInner = Math.max(0, innerHighlightOuter - Math.max(1, dpr));

        pushRing(
          shockwaveVertices,
          shockwaves[i].x,
          shockwaves[i].y,
          innerRadius,
          outerRadius,
          palette.accent,
          alpha,
        );
        pushRing(
          shockwaveVertices,
          shockwaves[i].x,
          shockwaves[i].y,
          innerHighlightInner,
          innerHighlightOuter,
          palette.fg,
          alpha * 0.6,
        );
      }

      drawMesh(glContext, meshProgram, meshBuffer, w, h, facetVertices);
      drawMesh(glContext, meshProgram, meshBuffer, w, h, lineVertices);
      drawPoints(glContext, pointProgram, pointBuffer, w, h, particleVertices);
      drawMesh(glContext, meshProgram, meshBuffer, w, h, scanlineVertices);

      if (mouseX > 0 && mouseY > 0) {
        const glowRadius = scaledMouseRadius * 1.2;
        glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE);
        drawRadial(
          glContext,
          radialProgram,
          radialBuffer,
          w,
          h,
          mouseX - glowRadius,
          mouseY - glowRadius,
          mouseX + glowRadius,
          mouseY + glowRadius,
          mouseX,
          mouseY,
          glowRadius,
          colorToVec4(mixColor(palette.fg, palette.accent, 0.42), 0.06),
          colorToVec4(palette.fg, 0.016),
          [0, 0, 0, 0],
          0.45,
        );
        glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);
      }

      drawMesh(glContext, meshProgram, meshBuffer, w, h, shockwaveVertices);

      const vignetteRadius = Math.max(w, h) * 0.7;
      drawRadial(
        glContext,
        radialProgram,
        radialBuffer,
        w,
        h,
        0,
        0,
        w,
        h,
        w * 0.5,
        h * 0.5,
        vignetteRadius,
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        colorToVec4(palette.bgRgb, VIGNETTE_ALPHA),
        0.4,
      );

      raf = window.requestAnimationFrame(render);
    }

    updatePalette();
    resize();

    const themeObserver = new MutationObserver(() => {
      updatePalette();
      for (let i = 0; i < particles.length; i++) {
        particles[i].color = i % 5 === 0 ? palette.fgDim : palette.fg;
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);

    const startTime = performance.now();
    render();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      themeObserver.disconnect();

      glContext.deleteBuffer(meshBuffer);
      glContext.deleteBuffer(pointBuffer);
      glContext.deleteBuffer(radialBuffer);
      glContext.deleteProgram(meshProgram.program);
      glContext.deleteProgram(pointProgram.program);
      glContext.deleteProgram(radialProgram.program);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
}
