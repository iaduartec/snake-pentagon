import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advanceGame,
  cellKey,
  createInitialState,
  queueDirection,
  tickMsForScore,
  type Direction,
  type GameState,
} from "../game/state";
import type { Cell } from "../game/types";

export function useSnakeGame(validCells: Cell[]) {
  const [state, setState] = useState<GameState>(() => createInitialState(validCells));
  const stateRef = useRef(state);
  const validKeys = useMemo(() => new Set(validCells.map(cellKey)), [validCells]);

  const updateState = useCallback((update: (current: GameState) => GameState) => {
    setState((current) => {
      const next = update(current);
      stateRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let accumulated = 0;

    const loop = (now: number) => {
      accumulated += Math.min(now - previous, 100);
      previous = now;
      const current = stateRef.current;
      const tick = tickMsForScore(current.score);

      if (current.status === "playing" && accumulated >= tick) {
        accumulated %= tick;
        updateState((latest) => advanceGame(latest, validKeys, validCells));
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [updateState, validCells, validKeys]);

  const start = useCallback(() => {
    updateState((current) =>
      current.status === "ready" || current.status === "paused"
        ? { ...current, status: "playing" }
        : current,
    );
  }, [updateState]);

  const restart = useCallback(() => {
    updateState(() => ({ ...createInitialState(validCells), status: "playing" }));
  }, [updateState, validCells]);

  const togglePause = useCallback(() => {
    updateState((current) => {
      if (current.status === "playing") return { ...current, status: "paused" };
      if (current.status === "paused") return { ...current, status: "playing" };
      return current;
    });
  }, [updateState]);

  const changeDirection = useCallback(
    (direction: Direction) => updateState((current) => queueDirection(current, direction)),
    [updateState],
  );

  return { state, start, restart, togglePause, changeDirection };
}
