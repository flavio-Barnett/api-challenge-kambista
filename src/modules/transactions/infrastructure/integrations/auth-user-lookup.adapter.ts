import { Injectable } from '@nestjs/common';

import { CheckUserExistsUseCase } from '../../../auth/application/use-cases/check-user-exists.use-case.js';
import { UserLookup } from '../../application/ports/user-lookup.port.js';

@Injectable()
export class AuthUserLookupAdapter extends UserLookup {
  constructor(private readonly checkUserExists: CheckUserExistsUseCase) {
    super();
  }

  exists(userId: string): Promise<boolean> {
    return this.checkUserExists.execute(userId);
  }
}
