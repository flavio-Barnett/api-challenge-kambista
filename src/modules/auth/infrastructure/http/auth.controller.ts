import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LogInUseCase } from '../../application/use-cases/log-in.use-case.js';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import { ApiLogIn, ApiRegister } from './auth.docs.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { LogInDto } from './dto/log-in.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly logIn: LogInUseCase,
  ) {}

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
}
