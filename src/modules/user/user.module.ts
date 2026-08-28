import { Module } from '@nestjs/common';
import { CreateUserController } from './controllers/create-user.controller';
import { CreateUserService } from './services/create-user.service';
import { USER_REPOSITORY } from './repositories/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FetchUsersService } from './services/fetch-users.service';
import { FetchUsersController } from './controllers/fetch-users.controller';
import { EmployeeModule } from '../employee/employee.module';
import { UpdateUserController } from './controllers/update-user.controller';
import { UpdateUserService } from './services/update-user.service';
import { DeleteUserController } from './controllers/delete-user.controller';
import { DeleteUserService } from './services/delete-user.service';
import { GetUserController } from './controllers/get-user.controller';
import { GetUserService } from './services/get-user.service';

@Module({
  imports: [PrismaModule, EmployeeModule],
  controllers: [
    CreateUserController,
    UpdateUserController,
    DeleteUserController,
    GetUserController,
    FetchUsersController,
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    GetUserService,
    FetchUsersService,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
