# Neon Snake Pentagon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive browser Snake game inside a fixed pentagonal playfield with a decorative rotating neon pentagon.

**Architecture:** React owns UI state and lifecycle while a focused Canvas 2D renderer draws the game. Pure TypeScript modules own pentagon geometry and deterministic game rules so movement, spawning, collisions, and speed can be unit tested independently from React.

**Tech Stack:** React 19, Vite 7, TypeScript 5, Canvas 2D, Vitest, Testing Library, CSS, localStorage.

## Global Constraints

- Create the app only inside `/home/ubuntu/snake-pentagon`.
- The pentagon rotation is decorative and must never alter logical movement or control direction.
- Keyboard controls: arrows and WASD; Space pauses; Enter restarts.
- Touch controls: swipe and on-screen directional buttons.
- Persist the high score locally when storage is available; continue safely without it.
- Respect `prefers-reduced-motion` without changing gameplay.
- No backend, accounts, multiplayer, online leaderboard, purchases, or public deployment.
- All visible controls and text remain code-native and accessible.

---

### Task 1: Visual concept and production asset

**Files:**
- Create: `artifacts/design/neon-snake-concept.png`
- Create: `public/assets/neon-space-bg.webp`
- Create: `src/styles/tokens.css`

**Interfaces:**
- Consumes: Approved design spec at `docs/superpowers/specs/2026-07-31-neon-snake-pentagon-design.md`.
- Produces: A full-screen visual reference, one background asset, and CSS custom properties consumed by Tasks 4-6.

- [ ] **Step 1: Generate the full game-screen concept**

Use Image Gen with the exact requirements from the design spec: dark spatial background, fixed pentagonal playfield, rotating double neon outer ring, cyan/green snake, pulsing magenta food, compact score/high-score chrome, pause/restart controls, and mobile-safe composition. Save the resulting concept as `artifacts/design/neon-snake-concept.png`.

- [ ] **Step 2: Review the concept at original resolution**

Run `view_image` on `artifacts/design/neon-snake-concept.png`. Reject clipping, illegible chrome, extra panels, code-drawn-looking placeholder art, or a rotating logical board. Present the concept for user approval before coding.

- [ ] **Step 3: Generate the separable background asset**

Use Image Gen to create a text-free, 16:9 dark spatial background matching the accepted concept. Save it as `public/assets/neon-space-bg.webp`; snake, food, HUD, borders, particles, and controls stay code-native because they animate and convey live state.

- [ ] **Step 4: Extract design tokens**

Create `src/styles/tokens.css` with these stable names, using sampled values from the accepted concept:

```css
:root {
  --color-bg: #03050d;
  --color-surface: rgba(8, 14, 29, 0.72);
  --color-cyan: #4ffcff;
  --color-green: #7dff95;
  --color-magenta: #ff3fcf;
  --color-text: #f2fbff;
  --color-muted: #8fa8bd;
  --color-danger: #ff4f76;
  --font-display: "Space Grotesk", "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", monospace;
  --shadow-cyan: 0 0 24px rgba(79, 252, 255, 0.5);
  --radius-control: 12px;
  --motion-fast: 160ms;
}
```

- [ ] **Step 5: Commit the accepted design artifacts**

```bash
git add artifacts/design/neon-snake-concept.png public/assets/neon-space-bg.webp src/styles/tokens.css
git commit -m "design: add neon snake visual system"
```

### Task 2: App scaffold and pentagon geometry

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/game/types.ts`
- Create: `src/game/geometry.ts`
- Create: `src/game/geometry.test.ts`

**Interfaces:**
- Consumes: Design tokens from Task 1.
- Produces: `Point`, `Cell`, `Pentagon`, `createPentagon()`, `pointInPolygon()`, `cellInsidePentagon()`, and `getPlayableCells()`.

- [ ] **Step 1: Scaffold the Vite project**

Create a React TypeScript Vite app with scripts `dev`, `build`, `lint`, `test`, and `test:watch`. Install React, Vite, TypeScript, ESLint, Vitest, jsdom, and Testing Library. `src/main.tsx` renders `<App />`; `App.tsx` initially renders `<main>Neon Snake</main>`.

- [ ] **Step 2: Define geometry types and failing tests**

```ts
export type Point = { x: number; y: number };
export type Cell = { col: number; row: number };
export type Pentagon = { center: Point; radius: number; vertices: Point[] };
```

Test that `createPentagon({ x: 250, y: 250 }, 200)` returns five vertices, the center is inside, a far point is outside, and every value returned by `getPlayableCells(21, pentagon, 12)` satisfies `cellInsidePentagon`.

- [ ] **Step 3: Run geometry tests and verify failure**

Run: `npm test -- src/game/geometry.test.ts`

Expected: FAIL because geometry functions are not implemented.

- [ ] **Step 4: Implement pure geometry helpers**

Implement:

```ts
export function createPentagon(center: Point, radius: number): Pentagon;
export function pointInPolygon(point: Point, vertices: Point[]): boolean;
export function cellInsidePentagon(cell: Cell, gridSize: number, pentagon: Pentagon, inset: number): boolean;
export function getPlayableCells(gridSize: number, pentagon: Pentagon, inset: number): Cell[];
```

Use a regular five-vertex polygon with the top vertex at `-Math.PI / 2`; use ray casting for point inclusion and require the cell center plus four inset corners to be inside.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- src/game/geometry.test.ts && npm run build`

Expected: all geometry tests pass and Vite builds.

```bash
git add package.json package-lock.json index.html tsconfig*.json vite.config.ts src
git commit -m "feat: scaffold game and add pentagon geometry"
```

### Task 3: Deterministic Snake rules

**Files:**
- Create: `src/game/state.ts`
- Create: `src/game/state.test.ts`

**Interfaces:**
- Consumes: `Cell` and valid-cell set from Task 2.
- Produces: `Direction`, `GameState`, `createInitialState()`, `queueDirection()`, `advanceGame()`, `spawnFood()`, and `tickMsForScore()`.

- [ ] **Step 1: Define state and failing behavior tests**

```ts
export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "ready" | "playing" | "paused" | "over" | "won";
export type GameState = {
  snake: Cell[];
  direction: Direction;
  queuedDirection: Direction;
  food: Cell | null;
  score: number;
  status: GameStatus;
};
```

Test: initial snake occupies three valid cells; opposite direction is rejected; a normal tick moves one cell; eating grows and adds 10 points; self collision ends the game; leaving valid cells ends the game; full occupancy returns `won`; food never spawns on the snake; speed drops from 150ms toward a 70ms floor.

- [ ] **Step 2: Run rule tests and verify failure**

Run: `npm test -- src/game/state.test.ts`

Expected: FAIL because state functions are not implemented.

- [ ] **Step 3: Implement the minimal pure state machine**

Implement these signatures:

```ts
export function createInitialState(validCells: Cell[], random?: () => number): GameState;
export function queueDirection(state: GameState, next: Direction): GameState;
export function advanceGame(state: GameState, validKeys: Set<string>, validCells: Cell[], random?: () => number): GameState;
export function spawnFood(validCells: Cell[], snake: Cell[], random?: () => number): Cell | null;
export function tickMsForScore(score: number): number;
export function cellKey(cell: Cell): string;
```

Use immutable state updates and inject randomness so tests remain deterministic.

- [ ] **Step 4: Run rule tests and commit**

Run: `npm test -- src/game/state.test.ts`

Expected: all state tests pass.

```bash
git add src/game/state.ts src/game/state.test.ts
git commit -m "feat: implement tested snake rules"
```

### Task 4: Canvas renderer and game loop

**Files:**
- Create: `src/game/renderer.ts`
- Create: `src/hooks/useSnakeGame.ts`
- Create: `src/components/GameCanvas.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `GameState`, geometry helpers, accepted design tokens, and background asset.
- Produces: `renderGame()`, `useSnakeGame()`, and `<GameCanvas />` with live state callbacks.

- [ ] **Step 1: Write a failing hook smoke test**

Create `src/hooks/useSnakeGame.test.tsx` with a harness that asserts the initial status is `ready`, `start()` changes it to `playing`, `togglePause()` changes it to `paused`, and `restart()` returns a fresh score of zero.

- [ ] **Step 2: Run the hook test and verify failure**

Run: `npm test -- src/hooks/useSnakeGame.test.tsx`

Expected: FAIL because `useSnakeGame` does not exist.

- [ ] **Step 3: Implement renderer and loop**

Implement:

```ts
export type RenderOptions = { width: number; height: number; timeMs: number; reducedMotion: boolean };
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, pentagon: Pentagon, options: RenderOptions): void;
```

Draw the static filled playfield, a separate rotating double pentagon ring, subtle grid points, rounded luminous snake segments, distinct head eyes, pulsing food, and short-lived eating particles. Keep logical coordinates unrotated. Scale for `devicePixelRatio` and clear the entire backing canvas each frame.

Implement `useSnakeGame()` with one animation frame for drawing and accumulated elapsed time for logic ticks. Clean up listeners and animation frames on unmount.

- [ ] **Step 4: Render the primary screen**

Compose the HUD and `<GameCanvas />` in `App.tsx`. The first viewport contains title, score, high score, compact pause/restart controls, game surface, and one-line keyboard guidance.

- [ ] **Step 5: Verify tests and commit**

Run: `npm test -- src/hooks/useSnakeGame.test.tsx && npm run build`

Expected: hook test and build pass.

```bash
git add src/App.tsx src/components src/game/renderer.ts src/hooks
git commit -m "feat: render playable neon snake"
```

### Task 5: Keyboard, touch, persistence, and responsive styling

**Files:**
- Create: `src/components/GameControls.tsx`
- Create: `src/components/GameOverlay.tsx`
- Create: `src/components/Hud.tsx`
- Create: `src/hooks/useHighScore.ts`
- Create: `src/hooks/useHighScore.test.tsx`
- Create: `src/styles/app.css`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `src/hooks/useSnakeGame.ts`

**Interfaces:**
- Consumes: Game actions from `useSnakeGame()`.
- Produces: accessible controls and resilient `useHighScore(score)` persistence.

- [ ] **Step 1: Write persistence tests**

Test that `useHighScore(30)` stores and returns 30, never replaces it with a lower score, and catches storage read/write errors while still returning an in-memory score.

- [ ] **Step 2: Run persistence tests and verify failure**

Run: `npm test -- src/hooks/useHighScore.test.tsx`

Expected: FAIL because `useHighScore` is not implemented.

- [ ] **Step 3: Implement controls and persistence**

Map Arrow/WASD keys to `queueDirection`, Space to pause, and Enter to start/restart. Add four labelled touch buttons and swipe detection with a 24px minimum travel. Prevent browser scrolling only for handled game keys or gestures on the game surface.

Implement `useHighScore(score: number): number` with key `neon-snake-pentagon:high-score`, guarded `localStorage` access, and in-memory fallback.

- [ ] **Step 4: Implement the accepted responsive visual system**

Use the Task 1 tokens and asset. The desktop game fits within `min(72vh, 720px)`; the mobile game uses available width, controls remain at least 44px, text does not overlap the canvas, and no horizontal overflow occurs at 360px. Hide decorative particles and slow the outer ring under `prefers-reduced-motion`.

- [ ] **Step 5: Run automated checks and commit**

Run: `npm test && npm run lint && npm run build`

Expected: all tests, lint, and build pass.

```bash
git add src
git commit -m "feat: add responsive controls and high score"
```

### Task 6: Browser QA and fidelity repair

**Files:**
- Modify: only files with verified functional or visual defects.
- Create temporarily, then remove: `artifacts/qa/*.png`.

**Interfaces:**
- Consumes: Complete game and accepted concept.
- Produces: Browser-verified, agency-signoff implementation with no temporary QA artifacts.

- [ ] **Step 1: Start the app and verify the core workflow**

Run: `npm run dev -- --host 127.0.0.1`

In the browser, verify ready → start → turn → eat → score increases → pause → resume → collide → game over → restart. Verify the rotating ring never affects logical movement.

- [ ] **Step 2: Verify desktop and mobile**

Capture desktop at the concept's native dimensions and mobile at 390x844. Verify touch targets, swipe, no clipping, no horizontal overflow, readable score, and correctly scaled canvas.

- [ ] **Step 3: Compare concept and implementation**

Use `view_image` on both `artifacts/design/neon-snake-concept.png` and the latest browser screenshot. Record and repair mismatches in copy, composition, typography, palette, neon treatment, spacing, pentagon geometry, responsive behavior, and motion.

- [ ] **Step 4: Run the final regression gate**

Run: `npm test && npm run lint && npm run build && git diff --check`

Expected: all commands exit 0 and no temporary QA files remain.

- [ ] **Step 5: Commit final repairs**

```bash
git add src public package.json package-lock.json
git commit -m "fix: complete neon snake browser verification"
```
