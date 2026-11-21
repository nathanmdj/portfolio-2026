import { stackLayers, typicalStackFloor, type LayerId, type StackLayer } from "@/content/profile";

/** The stack from the interface (shallowest) down to the network (deepest). */
export const layersByDepth: StackLayer[] = [...stackLayers].sort((a, b) => a.depth - b.depth);

/** Depth of the layer where, per the profile, most web developers stop. */
export const floorDepth =
  layersByDepth.find((layer) => layer.id === typicalStackFloor)?.depth ?? Infinity;

export function isPastFloor(layer: StackLayer): boolean {
  return layer.depth > floorDepth;
}

/** The stack layers the given ids touch, ordered from interface to network. */
export function layersReachedBy(ids: readonly LayerId[]): StackLayer[] {
  return layersByDepth.filter((layer) => ids.includes(layer.id));
}
