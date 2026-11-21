import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Group,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * The hero's network topology: slowly drifting nodes joined by thin links,
 * every eleventh node pulsing green. This module only builds and draws the
 * scene; when it runs, pauses or stops is decided by its caller.
 */
export type NetworkScene = {
  /** Draws the field as it stands `seconds` into the animation. */
  drawFrame: (seconds: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

const NODE_COUNT = 80;
const LINK_DISTANCE = 3.5;
const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;
const MAX_SEGMENTS = (NODE_COUNT * (NODE_COUNT - 1)) / 2;
const MAX_PIXEL_RATIO = 2;

/**
 * Raw sRGB channels for the shader uniforms. The shaders write these values
 * straight to the canvas, so they skip three's linear colour conversion.
 */
function srgb(hex: string): Vector3 {
  const n = Number.parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const NODE_GREY = srgb("#94a3b8");
const LINK_SLATE = srgb("#64748b");
const ACCENT_GREEN = srgb("#22c55e");

const nodeVertexShader = /* glsl */ `
  attribute float aPulse;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vPulse;
  varying float vBeat;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float beat = aPulse * (0.5 + 0.5 * sin(uTime * 1.4 + aSeed * 6.2832));
    vPulse = aPulse;
    vBeat = beat;
    float size = mix(4.0, 14.0, aPulse) + beat * 10.0;
    gl_PointSize = size * uPixelRatio * (12.0 / -mv.z);
  }
`;

const nodeFragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  varying float vPulse;
  varying float vBeat;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.3, d) * 0.7;
    float halo = pow(smoothstep(0.5, 0.0, d), 2.0) * (0.25 + 0.5 * vBeat);
    float core = smoothstep(0.16, 0.08, d);
    float alpha = mix(disc, max(halo, core * 0.95), vPulse);
    gl_FragColor = vec4(mix(uBase, uAccent, vPulse), alpha);
  }
`;

const linkVertexShader = /* glsl */ `
  attribute float aAlpha;
  attribute float aAccent;
  varying float vAlpha;
  varying float vAccent;
  void main() {
    vAlpha = aAlpha;
    vAccent = aAccent;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const linkFragmentShader = /* glsl */ `
  uniform vec3 uLine;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vAccent;
  void main() {
    gl_FragColor = vec4(mix(uLine, uAccent, vAccent * 0.7), vAlpha);
  }
`;

/** Resting positions, drift phases and pulse flags; seeded so every load lays out the same field. */
function layoutNodes() {
  let seed = 20260;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const base = new Float32Array(NODE_COUNT * 3);
  const phase = new Float32Array(NODE_COUNT * 3);
  const pulse = new Float32Array(NODE_COUNT);
  const nodeSeed = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) {
    base[i * 3] = rand() * 28 - 11;
    base[i * 3 + 1] = (rand() - 0.5) * 13;
    base[i * 3 + 2] = (rand() - 0.5) * 6;
    phase[i * 3] = rand() * Math.PI * 2;
    phase[i * 3 + 1] = rand() * Math.PI * 2;
    phase[i * 3 + 2] = rand() * Math.PI * 2;
    pulse[i] = i % 11 === 0 ? 1 : 0;
    nodeSeed[i] = rand();
  }
  return { base, phase, pulse, nodeSeed };
}

/** Throws when the browser cannot create a WebGL context. */
export function createNetworkScene(canvas: HTMLCanvasElement): NetworkScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 14);
  const field = new Group();
  scene.add(field);

  const { base, phase, pulse, nodeSeed } = layoutNodes();

  const nodePos = new Float32Array(NODE_COUNT * 3);
  const nodeGeo = new BufferGeometry();
  const nodePosAttr = new BufferAttribute(nodePos, 3).setUsage(DynamicDrawUsage);
  nodeGeo.setAttribute("position", nodePosAttr);
  nodeGeo.setAttribute("aPulse", new BufferAttribute(pulse, 1));
  nodeGeo.setAttribute("aSeed", new BufferAttribute(nodeSeed, 1));

  const time = { value: 0 };
  const nodeMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: time,
      uPixelRatio: { value: renderer.getPixelRatio() },
      uBase: { value: NODE_GREY },
      uAccent: { value: ACCENT_GREEN },
    },
    vertexShader: nodeVertexShader,
    fragmentShader: nodeFragmentShader,
  });
  const nodes = new Points(nodeGeo, nodeMat);
  nodes.frustumCulled = false;
  field.add(nodes);

  const linkPos = new Float32Array(MAX_SEGMENTS * 6);
  const linkAlpha = new Float32Array(MAX_SEGMENTS * 2);
  const linkAccent = new Float32Array(MAX_SEGMENTS * 2);
  const linkGeo = new BufferGeometry();
  const linkPosAttr = new BufferAttribute(linkPos, 3).setUsage(DynamicDrawUsage);
  const linkAlphaAttr = new BufferAttribute(linkAlpha, 1).setUsage(DynamicDrawUsage);
  const linkAccentAttr = new BufferAttribute(linkAccent, 1).setUsage(DynamicDrawUsage);
  linkGeo.setAttribute("position", linkPosAttr);
  linkGeo.setAttribute("aAlpha", linkAlphaAttr);
  linkGeo.setAttribute("aAccent", linkAccentAttr);

  const linkMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uLine: { value: LINK_SLATE }, uAccent: { value: ACCENT_GREEN } },
    vertexShader: linkVertexShader,
    fragmentShader: linkFragmentShader,
  });
  const links = new LineSegments(linkGeo, linkMat);
  links.frustumCulled = false;
  field.add(links);

  function drawFrame(t: number) {
    for (let i = 0; i < NODE_COUNT; i++) {
      const k = i * 3;
      nodePos[k] = base[k] + Math.sin(t * 0.13 + phase[k]) * 0.7;
      nodePos[k + 1] = base[k + 1] + Math.cos(t * 0.11 + phase[k + 1]) * 0.5;
      nodePos[k + 2] = base[k + 2] + Math.sin(t * 0.09 + phase[k + 2]) * 0.6;
    }
    nodePosAttr.needsUpdate = true;

    // Join every pair closer than the link distance; nearer pairs draw brighter.
    let seg = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      const ax = nodePos[i * 3];
      const ay = nodePos[i * 3 + 1];
      const az = nodePos[i * 3 + 2];
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const bx = nodePos[j * 3];
        const by = nodePos[j * 3 + 1];
        const bz = nodePos[j * 3 + 2];
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq > LINK_DISTANCE_SQ) continue;
        const alpha = (1 - Math.sqrt(distSq) / LINK_DISTANCE) * 0.6;
        const accent = Math.max(pulse[i], pulse[j]);
        const p = seg * 6;
        linkPos[p] = ax;
        linkPos[p + 1] = ay;
        linkPos[p + 2] = az;
        linkPos[p + 3] = bx;
        linkPos[p + 4] = by;
        linkPos[p + 5] = bz;
        linkAlpha[seg * 2] = linkAlpha[seg * 2 + 1] = alpha;
        linkAccent[seg * 2] = linkAccent[seg * 2 + 1] = accent;
        seg++;
      }
    }
    linkGeo.setDrawRange(0, seg * 2);
    linkPosAttr.needsUpdate = true;
    linkAlphaAttr.needsUpdate = true;
    linkAccentAttr.needsUpdate = true;

    time.value = t;
    field.rotation.y = Math.sin(t * 0.05) * 0.18;
    field.rotation.x = Math.sin(t * 0.035) * 0.06;
    renderer.render(scene, camera);
  }

  function resize(width: number, height: number) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Portrait screens pull back and shift right so the field still reads as a network.
    const portrait = camera.aspect < 1;
    camera.position.z = portrait ? 20 : 14;
    camera.position.x = portrait ? 3 : 0;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    nodeGeo.dispose();
    linkGeo.dispose();
    nodeMat.dispose();
    linkMat.dispose();
    renderer.dispose();
  }

  return { drawFrame, resize, dispose };
}
