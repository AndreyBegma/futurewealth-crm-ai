import userRepository from '@/repositories/user.repository';
import { PasswordService } from '@/utils/auth/password';
import { TokenService } from '@/utils/auth/token';
import { RegisterDto, LoginDto, UserResponseDto } from '@/dto/auth.dto';
import { AuthResponse, AuthTokens } from '@/types/auth.types';
import redisService from './redis.service';

export class AuthService {
  getCachedKey(userId: string): string {
    return `user-${userId}`;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { name, email, password } = registerDto;

    const existingUser = await userRepository.existsByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await PasswordService.hashPassword(password);

    const user = await userRepository.create({
      name,
      email,
      password,
      passwordHash,
    });

    const tokens = TokenService.generateTokens({
      userId: user.id,
      email: user.email,
      type: 'access',
    });

    return {
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await PasswordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = TokenService.generateTokens({
      userId: user.id,
      email: user.email,
      type: 'access',
    });

    return {
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = TokenService.verifyRefreshToken(refreshToken);

      const user = await userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return TokenService.generateTokens({
        userId: user.id,
        email: user.email,
        type: 'access',
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const cachedKey = this.getCachedKey(userId);
    const cachedUser = await redisService.getJSON<UserResponseDto>(cachedKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    try {
      await redisService.setJSON<UserResponseDto>(cachedKey, userInfo, 300);
    } catch (err) {
      console.error(err);
    }

    return userInfo;
  }
}

export default new AuthService();
