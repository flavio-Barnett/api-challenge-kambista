import { InvalidDateRangeError } from '../transactions.errors.js';
import { DateRange } from './date-range.vo.js';

describe('DateRange', () => {
  it('covers whole days in Lima time as a half-open UTC range', () => {
    const range = DateRange.fromLimaDates('2026-11-18', '2026-11-18');

    expect(range.start.toISOString()).toBe('2026-11-18T05:00:00.000Z');
    expect(range.end.toISOString()).toBe('2026-11-19T05:00:00.000Z');
  });

  it('includes the start and excludes the end', () => {
    const range = DateRange.fromLimaDates('2026-11-18', '2026-11-18');

    expect(range.contains(new Date('2026-11-18T05:00:00Z'))).toBe(true);
    expect(range.contains(new Date('2026-11-19T04:59:59.999Z'))).toBe(true);
    expect(range.contains(new Date('2026-11-19T05:00:00Z'))).toBe(false);
    expect(range.contains(new Date('2026-11-18T04:59:59.999Z'))).toBe(false);
  });

  it('spans several days', () => {
    const range = DateRange.fromLimaDates('2026-11-01', '2026-11-30');

    expect(range.start.toISOString()).toBe('2026-11-01T05:00:00.000Z');
    expect(range.end.toISOString()).toBe('2026-12-01T05:00:00.000Z');
  });

  it.each([
    ['an impossible date', '2026-02-30', '2026-03-01'],
    ['a malformed date', '18/11/2026', '2026-11-18'],
    ['an inverted range', '2026-11-19', '2026-11-18'],
  ])('rejects %s', (_case, start, end) => {
    expect(() => DateRange.fromLimaDates(start, end)).toThrow(
      expect.objectContaining({ code: 'INVALID_DATE_RANGE' }),
    );
    expect(() => DateRange.fromLimaDates(start, end)).toThrow(
      InvalidDateRangeError,
    );
  });
});
