export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Deterministic string hash so mock data stays consistent for the same inputs. */
export function seededHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length) % items.length];
}

/** Loose but sane phone number validation for a demo app (not a full E.164 parser). */
export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[\s\-().]/g, "");
  return /^\+?\d{7,15}$/.test(digits);
}

export function normalizePhoneNumber(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
