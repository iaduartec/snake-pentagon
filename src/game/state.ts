import type { Cell } from "./types";

export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "ready" | "playing" | "paused" | "over" | "won";

export type GameState = {
  snake: Cell[];
  direction: Direction;
  queuedDirection: Direction;
  food: Cell | null;
  score: number;
  status: GameStatus;
};

const vectors: Record<Direction, Cell> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const opposites: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function cellKey(cell: Cell): string {
  return `${cell.col}:${cell.row}`;
}

function centeredSnake(validCells: Cell[]): Cell[] {
  const keys = new Set(validCells.map(cellKey));
  const centerCol = validCells.reduce((sum, cell) => sum + cell.col, 0) / validCells.length;
  const centerRow = validCells.reduce((sum, cell) => sum + cell.row, 0) / validCells.length;
  const heads = validCells
    .filter((cell) =>
      keys.has(cellKey({ col: cell.col - 1, row: cell.row })) &&
      keys.has(cellKey({ col: cell.col - 2, row: cell.row })),
    )
    .sort(
      (a, b) =>
        Math.hypot(a.col - centerCol, a.row - centerRow) -
        Math.hypot(b.col - centerCol, b.row - centerRow),
    );
  const head = heads[0];

  if (!head) throw new Error("At least three adjacent playable cells are required");

  return [head, { col: head.col - 1, row: head.row }, { col: head.col - 2, row: head.row }];
}

export function spawnFood(
  validCells: Cell[],
  snake: Cell[],
  random: () => number = Math.random,
): Cell | null {
  const occupied = new Set(snake.map(cellKey));
  const available = validCells.filter((cell) => !occupied.has(cellKey(cell)));

  if (available.length === 0) return null;
  return available[Math.floor(random() * available.length) % available.length];
}

export function createInitialState(
  validCells: Cell[],
  random: () => number = Math.random,
): GameState {
  const snake = centeredSnake(validCells);

  return {
    snake,
    direction: "right",
    queuedDirection: "right",
    food: spawnFood(validCells, snake, random),
    score: 0,
    status: "ready",
  };
}

export function queueDirection(state: GameState, next: Direction): GameState {
  if (opposites[state.direction] === next) return state;
  return { ...state, queuedDirection: next };
}

export function advanceGame(
  state: GameState,
  validKeys: Set<string>,
  validCells: Cell[],
  random: () => number = Math.random,
): GameState {
  if (state.status !== "playing") return state;

  const vector = vectors[state.queuedDirection];
  const head = state.snake[0];
  const nextHead = { col: head.col + vector.col, row: head.row + vector.row };
  const eating = state.food !== null && cellKey(nextHead) === cellKey(state.food);
  const collisionBody = eating ? state.snake : state.snake.slice(0, -1);
  const collided = collisionBody.some((cell) => cellKey(cell) === cellKey(nextHead));

  if (!validKeys.has(cellKey(nextHead)) || collided) {
    return { ...state, direction: state.queuedDirection, status: "over" };
  }

  const snake = [nextHead, ...state.snake];
  if (!eating) snake.pop();

  const food = eating ? spawnFood(validCells, snake, random) : state.food;
  return {
    ...state,
    snake,
    direction: state.queuedDirection,
    food,
    score: state.score + (eating ? 10 : 0),
    status: eating && food === null ? "won" : state.status,
  };
}

export function tickMsForScore(score: number): number {
  return Math.max(70, 150 - Math.floor(score / 50) * 20);
}
