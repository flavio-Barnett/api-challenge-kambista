import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../../../shared/infrastructure/http/public.decorator.js';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case.js';
import { LogInUseCase } from '../../application/use-cases/log-in.use-case.js';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import { ApiCurrentUser, ApiLogIn, ApiRegister } from './auth.docs.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { LogInDto } from './dto/log-in.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';
import type { AuthenticatedUser } from './guards/authenticated-user.type.js';
import { CurrentUser } from './guards/current-user.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly logIn: LogInUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  @Public()
  @Post('register')
  @ApiRegister()
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    const session = await this.registerUser.execute({
      name: dto.nombre,
      email: dto.email,
      password: dto.password,
    });
    return AuthResponseDto.fromSession(session);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogIn()
  async login(@Body() dto: LogInDto): Promise<AuthResponseDto> {
    const session = await this.logIn.execute({
      email: dto.email,
      password: dto.password,
    });
    return AuthResponseDto.fromSession(session);
  }

  @Get('me')
  @ApiCurrentUser()
  async me(@CurrentUser() current: AuthenticatedUser): Promise<UsuarioDto> {
    return UsuarioDto.fromUser(await this.getCurrentUser.execute(current.id));
  }
}
