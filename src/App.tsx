import { useMemo } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { createPentagon, getPlayableCells } from "./game/geometry";
import { useSnakeGame } from "./hooks/useSnakeGame";

const pentagon = createPentagon({ x: 300, y: 300 }, 205);

export default function App() {
  const validCells = useMemo(() => getPlayableCells(21, pentagon, 2), []);
  const game = useSnakeGame(validCells);

  return (
    <main>
      <header>
        <h1>NEON SNAKE</h1>
        <p>SCORE {String(game.state.score).padStart(3, "0")}</p>
      </header>
      <GameCanvas state={game.state} pentagon={pentagon} />
      {game.state.status === "ready" && <button onClick={game.start}>START GAME</button>}
      <button onClick={game.togglePause}>PAUSE</button>
      <button onClick={game.restart}>RESTART</button>
    </main>
  );
}
