import { describe, expect, test } from "vitest";
import type { Cell } from "./types";
import {
  advanceGame,
  cellKey,
  createInitialState,
  queueDirection,
  spawnFood,
  tickMsForScore,
  type GameState,
} from "./state";

const grid = (size: number): Cell[] =>
  Array.from({ length: size * size }, (_, index) => ({
    col: index % size,
    row: Math.floor(index / size),
  }));

const validCells = grid(7);
const validKeys = new Set(validCells.map(cellKey));

const playingState = (overrides: Partial<GameState> = {}): GameState => ({
  snake: [
    { col: 3, row: 3 },
    { col: 2, row: 3 },
    { col: 1, row: 3 },
  ],
  direction: "right",
  queuedDirection: "right",
  food: { col: 6, row: 6 },
  score: 0,
  status: "playing",
  ...overrides,
});

describe("snake state", () => {
  test("starts with a three-cell snake on valid cells", () => {
    const state = createInitialState(validCells, () => 0);

    expect(state.snake).toHaveLength(3);
    expect(state.snake.every((cell) => validKeys.has(cellKey(cell)))).toBe(true);
    expect(state.status).toBe("ready");
  });

  test("rejects an immediate reverse direction", () => {
    const state = queueDirection(playingState(), "left");

    expect(state.queuedDirection).toBe("right");
  });

  test("moves one cell in the queued direction", () => {
    const state = advanceGame(
      queueDirection(playingState(), "up"),
      validKeys,
      validCells,
      () => 0,
    );

    expect(state.snake[0]).toEqual({ col: 3, row: 2 });
    expect(state.snake).toHaveLength(3);
  });

  test("grows and scores ten points when food is eaten", () => {
    const state = advanceGame(
      playingState({ food: { col: 4, row: 3 } }),
      validKeys,
      validCells,
      () => 0,
    );

    expect(state.snake[0]).toEqual({ col: 4, row: 3 });
    expect(state.snake).toHaveLength(4);
    expect(state.score).toBe(10);
  });

  test("ends the game after hitting its body", () => {
    const state = advanceGame(
      playingState({
        snake: [
          { col: 2, row: 2 },
          { col: 2, row: 3 },
          { col: 1, row: 3 },
          { col: 1, row: 2 },
          { col: 1, row: 1 },
        ],
        direction: "up",
        queuedDirection: "left",
      }),
      validKeys,
      validCells,
    );

    expect(state.status).toBe("over");
  });

  test("ends the game after leaving the valid pentagon cells", () => {
    const state = advanceGame(
      playingState({
        snake: [{ col: 6, row: 3 }, { col: 5, row: 3 }, { col: 4, row: 3 }],
      }),
      validKeys,
      validCells,
    );

    expect(state.status).toBe("over");
  });

  test("wins when eating fills every playable cell", () => {
    const tinyCells = [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }];
    const state = advanceGame(
      playingState({
        snake: [{ col: 1, row: 0 }, { col: 0, row: 0 }],
        food: { col: 2, row: 0 },
      }),
      new Set(tinyCells.map(cellKey)),
      tinyCells,
    );

    expect(state.status).toBe("won");
    expect(state.food).toBeNull();
  });

  test("spawns food only on an unoccupied cell", () => {
    const cells = [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }];

    expect(spawnFood(cells, cells.slice(0, 2), () => 0)).toEqual({ col: 2, row: 0 });
  });

  test("accelerates toward a safe seventy millisecond floor", () => {
    expect(tickMsForScore(0)).toBe(150);
    expect(tickMsForScore(50)).toBe(130);
    expect(tickMsForScore(10_000)).toBe(70);
  });
});
