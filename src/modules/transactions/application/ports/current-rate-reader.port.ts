import type { AppliedRate } from '../../domain/value-objects/applied-rate.vo.js';

export abstract class CurrentRateReader {
  abstract read(): Promise<AppliedRate>;
}
