import { Injectable } from '@nestjs/common';

import { Clock } from '../../domain/clock.port.js';

@Injectable()
export class SystemClockAdapter extends Clock {
  now(): Date {
    return new Date();
  }
}
