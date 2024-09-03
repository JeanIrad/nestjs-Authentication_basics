import { Body, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, LoginDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Token } from './types';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async signToken(userId: number, email: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.sign(
        { userId, email },
        { expiresIn: '15m', secret: process.env.JWT_SECRET },
      ),
      this.jwtService.sign(
        { userId, email },
        { expiresIn: '7d', secret: process.env.JWT_SECRET },
      ),
    ]);
    return { access_token, refresh_token };
  }

  async localSignup(dto: AuthDto): Promise<Token> {
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await this.hashData(dto.password),
        name: dto.name,
      },
    });
    const tokens = await this.signToken(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refresh_token);
    return tokens;
  }
  async updateRefreshToken(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }
  async localSignin(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) {
      throw new ForbiddenException('Invalid credentials');
    }
    const tokens = await this.signToken(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }
  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId, hashedRt: { not: null } },
      data: { hashedRt: null },
    });
  }
  async refreshToken(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(rt, user.hashedRt);
    console.log('IS VALID', isValid);
    if (!isValid) {
      throw new ForbiddenException('Invalid credentials');
    }
    const tokens = await this.signToken(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }
}
