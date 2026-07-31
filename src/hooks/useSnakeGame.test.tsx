import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { Cell } from "../game/types";
import { useSnakeGame } from "./useSnakeGame";

const validCells: Cell[] = Array.from({ length: 49 }, (_, index) => ({
  col: index % 7,
  row: Math.floor(index / 7),
}));

describe("useSnakeGame", () => {
  test("starts, pauses, and restarts a game", () => {
    const { result } = renderHook(() => useSnakeGame(validCells));

    expect(result.current.state.status).toBe("ready");

    act(() => result.current.start());
    expect(result.current.state.status).toBe("playing");

    act(() => result.current.togglePause());
    expect(result.current.state.status).toBe("paused");

    act(() => result.current.restart());
    expect(result.current.state.status).toBe("playing");
    expect(result.current.state.score).toBe(0);
  });
});
