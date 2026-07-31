import { useEffect, useState } from "react";

const STORAGE_KEY = "neon-snake-pentagon:high-score";

function storedHighScore(): number {
  try {
    const value = Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function useHighScore(score: number): number {
  const [highScore, setHighScore] = useState(() => Math.max(storedHighScore(), score));
  if (score > highScore) setHighScore(score);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(highScore));
    } catch {
      // Persistence is optional; the in-memory score remains authoritative.
    }
  }, [highScore]);

  return highScore;
}
