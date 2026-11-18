const LIMA_OFFSET_MS = 5 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function limaDate(daysFromToday = 0): string {
  const moment = Date.now() - LIMA_OFFSET_MS + daysFromToday * ONE_DAY_MS;
  return new Date(moment).toISOString().slice(0, 10);
}
