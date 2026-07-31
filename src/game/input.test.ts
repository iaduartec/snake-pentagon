import { describe, expect, test } from "vitest";
import { directionForKey, directionForSwipe } from "./input";

describe("game input", () => {
  test.each([
    ["ArrowUp", "up"],
    ["w", "up"],
    ["ArrowDown", "down"],
    ["s", "down"],
    ["ArrowLeft", "left"],
    ["a", "left"],
    ["ArrowRight", "right"],
    ["d", "right"],
  ] as const)("maps %s to %s", (key, direction) => {
    expect(directionForKey(key)).toBe(direction);
  });

  test("ignores unrelated keyboard keys", () => {
    expect(directionForKey("Tab")).toBeNull();
  });

  test("uses the dominant swipe axis after the minimum travel", () => {
    expect(directionForSwipe({ x: 10, y: 10 }, { x: 60, y: 20 })).toBe("right");
    expect(directionForSwipe({ x: 10, y: 70 }, { x: 5, y: 20 })).toBe("up");
    expect(directionForSwipe({ x: 10, y: 10 }, { x: 25, y: 15 })).toBeNull();
  });
});
