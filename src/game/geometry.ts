import type { Cell, Pentagon, Point } from "./types";

export function createPentagon(center: Point, radius: number): Pentagon {
  const vertices = Array.from({ length: 5 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });

  return { center, radius, vertices };
}

export function pointInPolygon(point: Point, vertices: Point[]): boolean {
  let inside = false;

  for (let current = 0, previous = vertices.length - 1; current < vertices.length; previous = current++) {
    const a = vertices[current];
    const b = vertices[previous];
    const crossesScanline = a.y > point.y !== b.y > point.y;
    const edgeX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;

    if (crossesScanline && point.x < edgeX) inside = !inside;
  }

  return inside;
}

function cellGeometry(cell: Cell, gridSize: number, pentagon: Pentagon) {
  const cellSize = (pentagon.radius * 2) / gridSize;
  const origin = {
    x: pentagon.center.x - pentagon.radius,
    y: pentagon.center.y - pentagon.radius,
  };
  const center = {
    x: origin.x + (cell.col + 0.5) * cellSize,
    y: origin.y + (cell.row + 0.5) * cellSize,
  };

  return { cellSize, center };
}

export function cellInsidePentagon(
  cell: Cell,
  gridSize: number,
  pentagon: Pentagon,
  inset: number,
): boolean {
  const { cellSize, center } = cellGeometry(cell, gridSize, pentagon);
  const extent = cellSize / 2 + inset;
  const probes = [
    center,
    { x: center.x - extent, y: center.y - extent },
    { x: center.x + extent, y: center.y - extent },
    { x: center.x + extent, y: center.y + extent },
    { x: center.x - extent, y: center.y + extent },
  ];

  return probes.every((point) => pointInPolygon(point, pentagon.vertices));
}

export function getPlayableCells(
  gridSize: number,
  pentagon: Pentagon,
  inset: number,
): Cell[] {
  const cells: Cell[] = [];

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const cell = { col, row };
      if (cellInsidePentagon(cell, gridSize, pentagon, inset)) cells.push(cell);
    }
  }

  return cells;
}
