import { describe, expect, test } from "vitest";
import {
  cellInsidePentagon,
  createPentagon,
  getPlayableCells,
  pointInPolygon,
} from "./geometry";

describe("pentagon geometry", () => {
  const pentagon = createPentagon({ x: 250, y: 250 }, 200);

  test("creates exactly five vertices", () => {
    expect(pentagon.vertices).toHaveLength(5);
  });

  test("classifies the center as inside and a far point as outside", () => {
    expect(pointInPolygon({ x: 250, y: 250 }, pentagon.vertices)).toBe(true);
    expect(pointInPolygon({ x: 10, y: 10 }, pentagon.vertices)).toBe(false);
  });

  test("returns only grid cells fully inset inside the pentagon", () => {
    const cells = getPlayableCells(21, pentagon, 2);

    expect(cells.length).toBeGreaterThan(200);
    expect(cells.every((cell) => cellInsidePentagon(cell, 21, pentagon, 2))).toBe(true);
  });
});
