import { useEffect, useMemo, useRef } from "react";
import { GameControls } from "./components/GameControls";
import { GameCanvas } from "./components/GameCanvas";
import { GameOverlay } from "./components/GameOverlay";
import { Hud } from "./components/Hud";
import { createPentagon, getPlayableCells } from "./game/geometry";
import { directionForKey, directionForSwipe } from "./game/input";
import type { Point } from "./game/types";
import { useHighScore } from "./hooks/useHighScore";
import { useSnakeGame } from "./hooks/useSnakeGame";
import "./styles/app.css";

const pentagon = createPentagon({ x: 300, y: 300 }, 205);

export default function App() {
  const validCells = useMemo(() => getPlayableCells(21, pentagon, 2), []);
  const { state, start, restart, togglePause, changeDirection } = useSnakeGame(validCells);
  const best = useHighScore(state.score);
  const pointerStart = useRef<Point | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = directionForKey(event.key);
      if (direction) {
        event.preventDefault();
        changeDirection(direction);
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        togglePause();
      }
      if (event.key === "Enter") {
        if (state.status === "ready" || state.status === "paused") start();
        if (state.status === "over" || state.status === "won") restart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeDirection, restart, start, state.status, togglePause]);

  const finishSwipe = (point: Point) => {
    if (!pointerStart.current) return;
    const direction = directionForSwipe(pointerStart.current, point);
    if (direction) changeDirection(direction);
    pointerStart.current = null;
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1 className="brand">NEON <span>SNAKE</span></h1>
        <Hud score={state.score} best={best} />
        <div className="topbar__actions">
          <button className="chrome-button" type="button" onClick={togglePause} aria-pressed={state.status === "paused"}>Ⅱ PAUSE</button>
          <button className="chrome-button" type="button" onClick={restart}>↻ RESTART</button>
        </div>
      </header>
      <section className="game-region" aria-label="Game">
        <div
          className="playfield-shell"
          onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
          onPointerUp={(event) => finishSwipe({ x: event.clientX, y: event.clientY })}
        >
          <GameCanvas state={state} pentagon={pentagon} />
          <GameOverlay status={state.status} score={state.score} onStart={start} onRestart={restart} />
        </div>
        <GameControls onDirection={changeDirection} />
      </section>
      <p className="instruction">ARROWS / WASD TO MOVE · SPACE TO PAUSE</p>
    </main>
  );
}
