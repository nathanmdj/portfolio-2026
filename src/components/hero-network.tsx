"use client";

import { useRef } from "react";
import { useNetworkScene } from "@/components/use-network-scene";

/**
 * The drifting network behind the hero copy. It fills its positioned parent and
 * is masked to almost nothing on the text side (the top on phones), then faded
 * into the page at the bottom, so it never competes with the copy over it.
 */
export function HeroNetwork() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const available = useNetworkScene(hostRef, canvasRef);

  if (!available) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-1 [mask-image:linear-gradient(90deg,rgb(0_0_0/0.08)_0%,rgb(0_0_0/0.2)_30%,#000_65%)] max-sm:opacity-55 max-sm:[mask-image:linear-gradient(180deg,#000_0%,rgb(0_0_0/0.35)_45%,transparent_85%)]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="block size-full" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(180deg,transparent,var(--background))]" />
    </div>
  );
}
