import { Global, Module } from '@nestjs/common';

import { Clock } from '../../domain/clock.port.js';
import { SystemClockAdapter } from './system-clock.adapter.js';

@Global()
@Module({
  providers: [{ provide: Clock, useClass: SystemClockAdapter }],
  exports: [Clock],
})
export class TimeModule {}
