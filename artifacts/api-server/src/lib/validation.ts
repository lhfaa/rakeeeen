export function readString(
  value: unknown,
  options: { min?: number; max?: number } = {},
): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  const min = options.min ?? 1;
  const max = options.max ?? 255;
  return result.length >= min && result.length <= max ? result : null;
}

export function readEmail(value: unknown): string | null {
  const email = readString(value, { min: 3, max: 320 })?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function readPositiveInt(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function readPositiveAmount(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1_000_000_000_000) {
    return null;
  }
  return Math.round(parsed * 100) / 100 === parsed ? parsed : null;
}