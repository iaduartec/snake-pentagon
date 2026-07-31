import type { Direction } from "../game/state";

type GameControlsProps = { onDirection: (direction: Direction) => void };

function ArrowIcon({ direction }: { direction: Direction }) {
  const rotations: Record<Direction, number> = { up: 0, right: 90, down: 180, left: 270 };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotations[direction]}deg)` }}>
      <path d="M12 4 5.5 11.2h4.1V20h4.8v-8.8h4.1L12 4Z" fill="currentColor" />
    </svg>
  );
}

export function GameControls({ onDirection }: GameControlsProps) {
  return (
    <div className="touch-controls" aria-label="Direction controls">
      {(["up", "left", "down", "right"] as const).map((direction) => (
        <button
          className={`touch-control touch-control--${direction}`}
          type="button"
          aria-label={`Move ${direction}`}
          onPointerDown={() => onDirection(direction)}
          key={direction}
        >
          <ArrowIcon direction={direction} />
        </button>
      ))}
    </div>
  );
}
