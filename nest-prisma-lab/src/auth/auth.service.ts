import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { user_role } from 'generated/prisma/enums';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;         // e.g., user ID
  username: string;    // user name
  role: string;     // roles/permissions
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {

    readonly logger = new Logger();
    
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;
        
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
        throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
        data: {
            email,
            password_hash: hashedPassword,
            name,
            role: registerDto.role ?? user_role.USER, // Default role for public registration
        },
        });

        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
        const { password_hash, ...result } = user;
        return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        this.logger.log("Run login....")
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload: JwtPayload = { username: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}