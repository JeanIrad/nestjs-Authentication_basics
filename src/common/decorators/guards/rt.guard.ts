import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class RtGuard extends AuthGuard('jwt-refresh-token') {
  constructor() {
    super();
  }
  //   canActivate(
  //     context: ExecutionContext,
  //   ): boolean | Promise<boolean> | Observable<boolean> {
  //     return super.canActivate(context);
  //   }
}
