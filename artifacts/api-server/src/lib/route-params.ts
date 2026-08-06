export function getRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function getPositiveRouteId(
  value: string | string[] | undefined,
): number | null {
  const raw = getRouteParam(value);
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}