import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { MembershipModule } from '../membership/membership.module';
import { Env } from 'src/env';
import { AuthRateLimitGuard } from 'src/common/http/auth-rate-limit.guard';
import { LoginController } from './controllers/login.controller';
import { RefreshController } from './controllers/refresh.controller';
import { LogoutController } from './controllers/logout.controller';
import { MeController } from './controllers/me.controller';
import { LoginService } from './services/login.service';
import { RefreshService } from './services/refresh.service';
import { LogoutService } from './services/logout.service';
import { MeService } from './services/me.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { REFRESH_TOKEN_REPOSITORY } from './repositories/refresh-token.repository';
import { PrismaRefreshTokenRepository } from './repositories/prisma-refresh-token.repository';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    UserModule,
    MembershipModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
    }),
  ],
  controllers: [
    LoginController,
    RefreshController,
    LogoutController,
    MeController,
  ],
  providers: [
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    TokenService,
    LoginService,
    RefreshService,
    LogoutService,
    MeService,
    JwtStrategy,
    AuthRateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
