import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../../../shared/infrastructure/http/authenticated-user.type.js';
import { CurrentUser } from '../../../../shared/infrastructure/http/current-user.decorator.js';
import { Public } from '../../../../shared/infrastructure/http/public.decorator.js';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case.js';
import { LogInUseCase } from '../../application/use-cases/log-in.use-case.js';
import { LogOutUseCase } from '../../application/use-cases/log-out.use-case.js';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case.js';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import {
  ApiCurrentUser,
  ApiLogIn,
  ApiLogOut,
  ApiRefreshSession,
  ApiRegister,
} from './auth.docs.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { LogInDto } from './dto/log-in.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly logIn: LogInUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logOut: LogOutUseCase,
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
  async login(
    @Body() dto: LogInDto,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    const session = await this.logIn.execute({
      email: dto.email,
      password: dto.password,
      ipAddress,
    });
    return AuthResponseDto.fromSession(session);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefreshSession()
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const session = await this.refreshSession.execute(dto.refresh_token);
    return AuthResponseDto.fromSession(session);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogOut()
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.logOut.execute(dto.refresh_token);
  }

  @Get('me')
  @ApiCurrentUser()
  async me(@CurrentUser() current: AuthenticatedUser): Promise<UsuarioDto> {
    return UsuarioDto.fromUser(await this.getCurrentUser.execute(current.id));
  }
}
