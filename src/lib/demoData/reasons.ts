/** Shared pool of plain-language explanation reasons used across demo routes. */
export const REASON_POOL = [
  "Lower walking exposure",
  "More public activity",
  "Better transport availability",
  "Lower traffic",
  "Shorter travel time",
  "Fewer transfers",
  "More convenient pickup point",
  "Better weather conditions",
  "Reduced waiting time",
  "More direct route",
  "Lower estimated delay",
  "Better route balance",
] as const;

/**
 * Deterministically picks 3-5 distinct reasons from the pool, varied by
 * seed/offset. Step size 5 is coprime with the pool length (12), so indices
 * never repeat within a single pick even at the max count.
 */
export function pickReasons(offset: number, count: number): string[] {
  const n = Math.min(Math.max(count, 3), 5);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(REASON_POOL[(offset + i * 5) % REASON_POOL.length]);
  }
  return out;
}
