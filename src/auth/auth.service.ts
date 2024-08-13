import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

const fakeUsers = [
  {
    id: 1,
    username: 'Jean',
    password: 'Jean@123',
  },
  {
    id: 2,
    username: 'Peter',
    password: 'Jean@123',
  },
];
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  validateUser({ username, password }: AuthPayloadDto) {
    const user = fakeUsers.find((user) => user.username === username);
    if (!user) return null;
    if (password === user.password) {
      const { password, ...userPayload } = user;
      return this.jwtService.sign(userPayload);
    }
  }
}
