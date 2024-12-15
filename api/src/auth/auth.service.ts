import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findOneBy({
      username: data.username,
    });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      username: data.username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return { message: 'User registered successfully' };
  }

  async login(data: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOneBy({
      username: data.username,
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  async googleLogin(user: any): Promise<{ access_token: string }> {
    const { email, firstName, lastName } = user;

    let existingUser = await this.userRepository.findOne({
      where: { username: email },
    });

    if (!existingUser) {
      existingUser = this.userRepository.create({
        username: email,
        password: '',
        firstName,
        lastName,
      });
      await this.userRepository.save(existingUser);
    }

    const payload = { sub: existingUser.id, username: existingUser.username };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  async validateGoogleUser(profile: any): Promise<{ access_token: string }> {
    const { email, firstName, lastName } = profile;

    let user = await this.userRepository.findOne({
      where: { username: email },
    });

    if (!user) {
      user = this.userRepository.create({
        username: email,
        password: null,
        firstName,
        lastName,
      });
      await this.userRepository.save(user);
    }

    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
