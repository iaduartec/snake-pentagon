import type { GameStatus } from "../game/state";

type GameOverlayProps = {
  status: GameStatus;
  score: number;
  onStart: () => void;
  onRestart: () => void;
};

export function GameOverlay({ status, score, onStart, onRestart }: GameOverlayProps) {
  if (status === "playing") return null;

  const content = {
    ready: { title: "", action: "START GAME", handler: onStart },
    paused: { title: "PAUSED", action: "CONTINUE", handler: onStart },
    over: { title: `GAME OVER · ${String(score).padStart(3, "0")}`, action: "RESTART", handler: onRestart },
    won: { title: "PENTAGON CLEARED", action: "PLAY AGAIN", handler: onRestart },
  }[status];

  return (
    <div className="game-overlay" role="status">
      {content.title && <p>{content.title}</p>}
      <button type="button" onClick={content.handler}>{content.action}</button>
    </div>
  );
}
