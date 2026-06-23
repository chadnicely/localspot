import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TrucksService } from '../trucks/trucks.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly trucks: TrucksService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.users.verifyPassword(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildSession(user);
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('An account with that email already exists');
    }
    const user = await this.users.create(dto.truckName, dto.email, dto.password, 'truck_owner');
    // Create the owner's pending food-truck profile (inactive until admin approves).
    await this.trucks.createForOwner(user._id.toString(), {
      name: dto.truckName,
      email: dto.email,
      plan: dto.plan,
    });
    return this.buildSession(user);
  }

  private async buildSession(user: {
    _id: { toString(): string };
    name: string;
    email: string;
    role: string;
  }) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
