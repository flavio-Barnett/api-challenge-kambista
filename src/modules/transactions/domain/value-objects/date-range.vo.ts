import { InvalidDateRangeError } from '../transactions.errors.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LIMA_UTC_OFFSET = '-05:00';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function startOfLimaDay(value: string): Date {
  return new Date(`${value}T00:00:00${LIMA_UTC_OFFSET}`);
}

export class DateRange {
  private constructor(
    readonly start: Date,
    readonly end: Date,
  ) {}

  static fromLimaDates(startDate: string, endDate: string): DateRange {
    const isValid =
      isCalendarDate(startDate) &&
      isCalendarDate(endDate) &&
      startDate <= endDate;
    if (!isValid) {
      throw new InvalidDateRangeError();
    }
    const start = startOfLimaDay(startDate);
    const end = new Date(startOfLimaDay(endDate).getTime() + ONE_DAY_MS);
    return new DateRange(start, end);
  }

  contains(moment: Date): boolean {
    return moment >= this.start && moment < this.end;
  }
}
