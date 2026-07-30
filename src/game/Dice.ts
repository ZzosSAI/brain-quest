// ─── Simple seeded dice ────────────────────────────────

let rollSeed = Date.now();

export function rollDice(): number {
  rollSeed = (rollSeed * 16807) % 2147483647;
  return (rollSeed % 6) + 1;
}

export function resetDiceSeed(seed?: number) {
  rollSeed = seed ?? Date.now();
}
