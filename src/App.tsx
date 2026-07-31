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
  const game = useSnakeGame(validCells);
  const best = useHighScore(game.state.score);
  const pointerStart = useRef<Point | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = directionForKey(event.key);
      if (direction) {
        event.preventDefault();
        game.changeDirection(direction);
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        game.togglePause();
      }
      if (event.key === "Enter") {
        if (game.state.status === "ready" || game.state.status === "paused") game.start();
        if (game.state.status === "over" || game.state.status === "won") game.restart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game]);

  const finishSwipe = (point: Point) => {
    if (!pointerStart.current) return;
    const direction = directionForSwipe(pointerStart.current, point);
    if (direction) game.changeDirection(direction);
    pointerStart.current = null;
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1 className="brand">NEON <span>SNAKE</span></h1>
        <Hud score={game.state.score} best={best} />
        <div className="topbar__actions">
          <button className="chrome-button" type="button" onClick={game.togglePause} aria-pressed={game.state.status === "paused"}>Ⅱ PAUSE</button>
          <button className="chrome-button" type="button" onClick={game.restart}>↻ RESTART</button>
        </div>
      </header>
      <section className="game-region" aria-label="Game">
        <div
          className="playfield-shell"
          onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
          onPointerUp={(event) => finishSwipe({ x: event.clientX, y: event.clientY })}
        >
          <GameCanvas state={game.state} pentagon={pentagon} />
          <GameOverlay status={game.state.status} score={game.state.score} onStart={game.start} onRestart={game.restart} />
        </div>
        <GameControls onDirection={game.changeDirection} />
      </section>
      <p className="instruction">ARROWS / WASD TO MOVE · SPACE TO PAUSE</p>
    </main>
  );
}
