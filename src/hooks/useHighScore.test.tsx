import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useHighScore } from "./useHighScore";

describe("useHighScore", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  test("stores a new high score and does not replace it with a lower score", () => {
    const { result, rerender } = renderHook(
      ({ score }: { score: number }) => useHighScore(score),
      { initialProps: { score: 30 } },
    );

    expect(result.current).toBe(30);
    expect(localStorage.getItem("neon-snake-pentagon:high-score")).toBe("30");

    rerender({ score: 10 });
    expect(result.current).toBe(30);
    expect(localStorage.getItem("neon-snake-pentagon:high-score")).toBe("30");
  });

  test("continues with an in-memory score when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    const { result } = renderHook(() => useHighScore(40));

    expect(result.current).toBe(40);
  });
});
