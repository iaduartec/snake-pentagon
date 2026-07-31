import { useEffect, useRef } from "react";
import { renderGame } from "../game/renderer";
import type { GameState } from "../game/state";
import type { Pentagon } from "../game/types";

type GameCanvasProps = {
  state: GameState;
  pentagon: Pentagon;
};

export function GameCanvas({ state, pentagon }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const draw = (timeMs: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(dpr * (rect.width / 600), 0, 0, dpr * (rect.height / 600), 0, 0);
      renderGame(ctx, stateRef.current, pentagon, {
        width: 600,
        height: 600,
        timeMs,
        reducedMotion,
      });
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [pentagon]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Neon Snake playfield" />;
}
