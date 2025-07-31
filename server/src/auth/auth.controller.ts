import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from 'src/services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../services/users.service'; // ajusta ruta si es necesario
import { ConfigService } from '@nestjs/config';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
  private authService: AuthService,
  private readonly userService: UsersService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  register(@Body() dto: CreateUserDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || (req.socket && req.socket.remoteAddress);
    return this.authService.register(dto, userAgent, ipAddress);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress =
      (req as any).clientIp || req.ip || req.connection.remoteAddress;
    return this.authService.login(
      dto.email,
      dto.password,
      userAgent,
      ipAddress,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user (revoke refresh token)' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refresh_token);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logoutAll(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.logoutAll(user.userId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({
    status: 200,
    description: 'User sessions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserSessions(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.getUserSessions(user.userId);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }


@Post('forgot-password')
async forgotPassword(@Body() dto: ForgotPasswordDto) {
  const user = await this.userService.findByEmail(dto.email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const token = this.jwtService.sign(
    { email: user.email },
    {
      secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
      expiresIn: '15m',
    },
  );

  // En vez de enviar el email aquí, simplemente devuelves el token
  return { token };
}


}
