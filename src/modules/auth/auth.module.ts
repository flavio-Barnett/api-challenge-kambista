import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { authProviders } from './auth.providers.js';
import { AuthController } from './infrastructure/http/auth.controller.js';
import {
  USER_MODEL,
  userSchema,
} from './infrastructure/persistence/user.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL, schema: userSchema }]),
  ],
  controllers: [AuthController],
  providers: authProviders,
})
export class AuthModule {}
