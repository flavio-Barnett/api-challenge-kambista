import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigModule } from '../../../../shared/infrastructure/config/app-config.module.js';
import { DatabaseModule } from '../../../../shared/infrastructure/database/database.module.js';
import { useCase } from '../../../../shared/infrastructure/di/use-case.provider.js';
import { PromoteUserToAdminUseCase } from '../../application/use-cases/promote-user-to-admin.use-case.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { MongoUserRepository } from '../persistence/mongo-user.repository.js';
import { USER_MODEL, userSchema } from '../persistence/user.schema.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    MongooseModule.forFeature([{ name: USER_MODEL, schema: userSchema }]),
  ],
  providers: [
    { provide: UserRepository, useClass: MongoUserRepository },
    useCase(PromoteUserToAdminUseCase, [UserRepository]),
  ],
})
export class PromoteUserCliModule {}
