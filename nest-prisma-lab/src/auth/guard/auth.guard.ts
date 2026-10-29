import { CanActivate, Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;         // e.g., user ID
  username: string;    // user name
  role: string;     // roles/permissions
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    readonly logger = new Logger();
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) return false;
    const [, token] = authHeader.split(' ');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: {
            id: Number(payload.sub)
        }
      });
      if (!user) return false;
      request.user = user;
      this.logger.log(`Verify: ${user.name}`)
      return true;
    } catch (err: any) {
        this.logger.error(err.message)
      return false;
    }
  }
}