import { Clock } from '../../src/shared/domain/clock.port.js';

export class ControllableClock extends Clock {
  private frozenAt: Date | null = null;

  now(): Date {
    return this.frozenAt ?? new Date();
  }

  freezeAt(moment: Date): void {
    this.frozenAt = moment;
  }

  resume(): void {
    this.frozenAt = null;
  }
}
