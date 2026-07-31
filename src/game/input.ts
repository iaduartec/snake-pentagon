import type { Direction } from "./state";
import type { Point } from "./types";

const keyDirections: Record<string, Direction> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

export function directionForKey(key: string): Direction | null {
  return keyDirections[key] ?? null;
}

export function directionForSwipe(start: Point, end: Point): Direction | null {
  const x = end.x - start.x;
  const y = end.y - start.y;
  if (Math.max(Math.abs(x), Math.abs(y)) < 24) return null;
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? "right" : "left";
  return y > 0 ? "down" : "up";
}
