const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SEED_LENGTH = 6;

export function sanitizeSeed(seed: string | null | undefined): string | null {
  if (!seed) {
    return null;
  }

  const sanitized = seed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return sanitized.length >= 4 ? sanitized : null;
}

export function generateSeed(length = SEED_LENGTH): string {
  let value = '';
  const cryptoValues = typeof crypto !== 'undefined' ? crypto.getRandomValues(new Uint32Array(length)) : null;

  for (let index = 0; index < length; index += 1) {
    const random = cryptoValues ? cryptoValues[index] : Math.floor(Math.random() * 2 ** 32);
    value += SEED_ALPHABET[random % SEED_ALPHABET.length];
  }

  return value;
}

export function seedToInt(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
