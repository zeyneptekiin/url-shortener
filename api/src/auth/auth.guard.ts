import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or malformed Authorization header');
      throw new UnauthorizedException(
        'Authorization header is missing or malformed',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'default-secret',
      });

      console.log('Token validation successful. Payload:', payload);

      request.user = payload;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.error('Token has expired');
        throw new UnauthorizedException('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        console.error('Malformed JWT:', error.message);
        throw new UnauthorizedException('Malformed token');
      } else {
        console.error('Token validation failed:', error.message);
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}
