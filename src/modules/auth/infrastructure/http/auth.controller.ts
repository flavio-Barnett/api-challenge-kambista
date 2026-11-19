import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import type { AuthenticatedUser } from '../../../../shared/infrastructure/http/authenticated-user.type.js';
import { CurrentUser } from '../../../../shared/infrastructure/http/current-user.decorator.js';
import { Public } from '../../../../shared/infrastructure/http/public.decorator.js';
import { InvalidRefreshTokenError } from '../../application/auth.errors.js';
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
import { AccessTokenDto } from './dto/access-token.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { LogInDto } from './dto/log-in.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';
import { TrustedOriginGuard } from './guards/trusted-origin.guard.js';
import { RefreshTokenCookie } from './refresh-token.cookie.js';
import { RefreshTokenFromCookie } from './refresh-token-from-cookie.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly logIn: LogInUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logOut: LogOutUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly refreshTokenCookie: RefreshTokenCookie,
  ) {}

  @Public()
  @Post('register')
  @ApiRegister()
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.registerUser.execute({
      name: dto.nombre,
      email: dto.email,
      password: dto.password,
    });
    this.refreshTokenCookie.write(response, session.refreshToken);
    return AuthResponseDto.fromSession(session);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogIn()
  async login(
    @Body() dto: LogInDto,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.logIn.execute({
      email: dto.email,
      password: dto.password,
      ipAddress,
    });
    this.refreshTokenCookie.write(response, session.refreshToken);
    return AuthResponseDto.fromSession(session);
  }

  @Public()
  @UseGuards(TrustedOriginGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefreshSession()
  async refresh(
    @RefreshTokenFromCookie() refreshToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    if (refreshToken === undefined) {
      throw new InvalidRefreshTokenError();
    }
    const session = await this.refreshSession.execute(refreshToken);
    this.refreshTokenCookie.write(response, session.refreshToken);
    return AccessTokenDto.fromSession(session);
  }

  @Public()
  @UseGuards(TrustedOriginGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogOut()
  async logout(
    @RefreshTokenFromCookie() refreshToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    if (refreshToken !== undefined) {
      await this.logOut.execute(refreshToken);
    }
    this.refreshTokenCookie.clear(response);
  }

  @Get('me')
  @ApiCurrentUser()
  async me(@CurrentUser() current: AuthenticatedUser): Promise<UsuarioDto> {
    return UsuarioDto.fromUser(await this.getCurrentUser.execute(current.id));
  }
}
