import { LocalGuard } from './guards/local.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(new LocalGuard())
  login(@Req() req: Request) {
    return req.user;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: Request) {
    console.log(request.user);
    return request.user;
  }
}
