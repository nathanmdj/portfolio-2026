import { useEffect, useState, type RefObject } from "react";
import type { NetworkScene } from "@/components/network-scene";

/** Longest step the drift takes in one frame, so a stalled tab does not jump the field. */
const MAX_STEP_SECONDS = 0.05;

/**
 * Animates the scene only while it can be seen: on screen, in a visible tab and
 * without a reduced-motion preference (which gets one still frame instead).
 * Returns the function that stops everything and frees the GPU resources.
 */
function runScene(
  scene: NetworkScene,
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  onContextLost: () => void,
): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  let onScreen = true;
  let tabVisible = !document.hidden;
  let reduced = reduceMotion.matches;

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    elapsed += Math.min((now - last) / 1000, MAX_STEP_SECONDS);
    last = now;
    scene.drawFrame(elapsed);
  };

  const stopLoop = () => {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const sync = () => {
    const shouldRun = onScreen && tabVisible && !reduced;
    if (shouldRun && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!shouldRun) {
      stopLoop();
    }
    if (reduced) scene.drawFrame(elapsed);
  };

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    scene.resize(width, height);
    // A paused field still has to be redrawn at the new size.
    if (!frame) scene.drawFrame(elapsed);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const visibilityObserver = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    sync();
  });
  visibilityObserver.observe(host);

  const onVisibilityChange = () => {
    tabVisible = !document.hidden;
    sync();
  };
  const onMotionChange = (event: MediaQueryListEvent) => {
    reduced = event.matches;
    sync();
  };
  const onLost = (event: Event) => {
    event.preventDefault();
    onContextLost();
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  reduceMotion.addEventListener("change", onMotionChange);
  canvas.addEventListener("webglcontextlost", onLost);

  resize();
  sync();

  return () => {
    stopLoop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    reduceMotion.removeEventListener("change", onMotionChange);
    canvas.removeEventListener("webglcontextlost", onLost);
    scene.dispose();
  };
}

/**
 * Loads three.js after the page has painted and runs the network scene on the
 * given canvas, sized to its host. Returns false once WebGL turns out to be
 * unavailable or its context is lost, so the caller can drop the canvas.
 */
export function useNetworkScene(
  hostRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): boolean {
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let cancelled = false;
    let stop: (() => void) | undefined;

    const shutDown = () => {
      stop?.();
      stop = undefined;
    };
    const fail = () => {
      shutDown();
      if (!cancelled) setAvailable(false);
    };

    (async () => {
      try {
        const { createNetworkScene } = await import("@/components/network-scene");
        if (cancelled) return;
        const scene = createNetworkScene(canvas);
        try {
          stop = runScene(scene, host, canvas, fail);
        } catch (error) {
          scene.dispose();
          throw error;
        }
      } catch {
        fail();
      }
    })();

    return () => {
      cancelled = true;
      shutDown();
    };
  }, [hostRef, canvasRef]);

  return available;
}
