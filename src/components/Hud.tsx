type HudProps = { score: number; best: number };

export function Hud({ score, best }: HudProps) {
  return (
    <div className="hud" aria-label="Score">
      <div className="hud__stat">
        <span>SCORE</span>
        <strong>{String(score).padStart(3, "0")}</strong>
      </div>
      <span className="hud__divider" aria-hidden="true" />
      <div className="hud__stat">
        <span>BEST</span>
        <strong>{String(best).padStart(3, "0")}</strong>
      </div>
    </div>
  );
}
