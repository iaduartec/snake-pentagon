import type { Direction, GameState } from "./state";
import type { Pentagon, Point } from "./types";

export type RenderOptions = {
  width: number;
  height: number;
  timeMs: number;
  reducedMotion: boolean;
};

const GRID_SIZE = 21;

function tracePolygon(ctx: CanvasRenderingContext2D, vertices: Point[]) {
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  vertices.slice(1).forEach((vertex) => ctx.lineTo(vertex.x, vertex.y));
  ctx.closePath();
}

function rotatedVertices(pentagon: Pentagon, angle: number, scale: number): Point[] {
  return pentagon.vertices.map((vertex) => {
    const x = (vertex.x - pentagon.center.x) * scale;
    const y = (vertex.y - pentagon.center.y) * scale;
    return {
      x: pentagon.center.x + x * Math.cos(angle) - y * Math.sin(angle),
      y: pentagon.center.y + x * Math.sin(angle) + y * Math.cos(angle),
    };
  });
}

function cellBox(pentagon: Pentagon, col: number, row: number) {
  const size = (pentagon.radius * 2) / GRID_SIZE;
  return {
    x: pentagon.center.x - pentagon.radius + col * size,
    y: pentagon.center.y - pentagon.radius + row * size,
    size,
  };
}

function eyeOffsets(direction: Direction, size: number) {
  const forward = size * 0.2;
  const side = size * 0.19;
  if (direction === "left" || direction === "right") {
    const sign = direction === "right" ? 1 : -1;
    return [
      { x: forward * sign, y: -side },
      { x: forward * sign, y: side },
    ];
  }
  const sign = direction === "down" ? 1 : -1;
  return [
    { x: -side, y: forward * sign },
    { x: side, y: forward * sign },
  ];
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  pentagon: Pentagon,
  options: RenderOptions,
) {
  const { width, height, timeMs, reducedMotion } = options;
  ctx.clearRect(0, 0, width, height);

  const rotation = reducedMotion ? -0.025 : timeMs / 18_000;
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = "#ff4dca";
  ctx.strokeStyle = "#ff65d4";
  ctx.lineWidth = 2.4;
  tracePolygon(ctx, rotatedVertices(pentagon, rotation, 1.18));
  ctx.stroke();
  ctx.globalAlpha = 0.52;
  ctx.lineWidth = 1;
  tracePolygon(ctx, rotatedVertices(pentagon, rotation + 0.018, 1.22));
  ctx.stroke();
  ctx.restore();

  ctx.save();
  tracePolygon(ctx, pentagon.vertices);
  ctx.clip();
  const fieldGradient = ctx.createRadialGradient(
    pentagon.center.x,
    pentagon.center.y,
    20,
    pentagon.center.x,
    pentagon.center.y,
    pentagon.radius,
  );
  fieldGradient.addColorStop(0, "rgba(7, 37, 50, .9)");
  fieldGradient.addColorStop(1, "rgba(3, 13, 28, .96)");
  ctx.fillStyle = fieldGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(43, 220, 238, .22)";
  const cellSize = (pentagon.radius * 2) / GRID_SIZE;
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const box = cellBox(pentagon, col, row);
      ctx.beginPath();
      ctx.arc(box.x + cellSize / 2, box.y + cellSize / 2, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state.food) {
    const food = cellBox(pentagon, state.food.col, state.food.row);
    const pulse = reducedMotion ? 1 : 1 + Math.sin(timeMs / 180) * 0.12;
    const cx = food.x + food.size / 2;
    const cy = food.y + food.size / 2;
    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#ff3fcf";
    ctx.strokeStyle = "#ff64d8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, food.size * 0.27 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(cx, cy, food.size * 0.14 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#fff0fc";
    ctx.fill();
    if (!reducedMotion) {
      for (let index = 0; index < 6; index += 1) {
        const angle = index * (Math.PI / 3) + timeMs / 900;
        const radius = food.size * (0.42 + (index % 2) * 0.18);
        ctx.fillStyle = "#ff4dca";
        ctx.fillRect(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 1.5, 1.5);
      }
    }
    ctx.restore();
  }

  state.snake
    .slice()
    .reverse()
    .forEach((cell, reverseIndex) => {
      const index = state.snake.length - 1 - reverseIndex;
      const box = cellBox(pentagon, cell.col, cell.row);
      const pad = box.size * 0.12;
      const mix = index / Math.max(1, state.snake.length - 1);
      ctx.save();
      ctx.shadowBlur = 13;
      ctx.shadowColor = mix < 0.5 ? "#8fff36" : "#35edff";
      ctx.fillStyle = mix < 0.5 ? "#82f83e" : "#28dff2";
      ctx.strokeStyle = mix < 0.5 ? "#bcff69" : "#8cffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(box.x + pad, box.y + pad, box.size - pad * 2, box.size - pad * 2, box.size * 0.26);
      ctx.fill();
      ctx.stroke();

      if (index === 0) {
        const cx = box.x + box.size / 2;
        const cy = box.y + box.size / 2;
        eyeOffsets(state.direction, box.size).forEach((offset) => {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#f7ffff";
          ctx.beginPath();
          ctx.arc(cx + offset.x, cy + offset.y, box.size * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#06121d";
          ctx.beginPath();
          ctx.arc(cx + offset.x, cy + offset.y, box.size * 0.047, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    });
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#38f4ff";
  ctx.strokeStyle = "#38f4ff";
  ctx.lineWidth = 2;
  tracePolygon(ctx, pentagon.vertices);
  ctx.stroke();
  ctx.restore();
}
