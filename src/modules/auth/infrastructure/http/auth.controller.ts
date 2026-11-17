import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import { ApiRegister } from './auth.docs.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly registerUser: RegisterUserUseCase) {}

  @Post('register')
  @ApiRegister()
  async register(@Body() dto: RegisterUserDto): Promise<UsuarioDto> {
    const user = await this.registerUser.execute({
      name: dto.nombre,
      email: dto.email,
      password: dto.password,
    });
    return UsuarioDto.fromUser(user);
  }
}
