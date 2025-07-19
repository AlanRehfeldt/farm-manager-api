import { Module } from '@nestjs/common';
import { CreateUserController } from './controllers/create-user.controller';
import { CreateUserService } from './services/create-user.service';
import { USER_REPOSITORY } from './repositories/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FetchUsersService } from './services/fetch-users.service';
import { FetchUserController } from './controllers/fetch-user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CreateUserController, FetchUserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserService,
    FetchUsersService,
  ],
})
export class UserModule {}
