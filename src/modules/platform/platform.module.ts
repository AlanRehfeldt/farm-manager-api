import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CostCategoryModule } from '../cost-category/cost-category.module';
import { FarmModule } from '../farm/farm.module';
import { MembershipModule } from '../membership/membership.module';
import { UserModule } from '../user/user.module';
import { CreatePlatformOrganizationController } from './controllers/create-platform-organization.controller';
import { CreatePlatformUserController } from './controllers/create-platform-user.controller';
import { FetchPlatformOrganizationFarmsController } from './controllers/fetch-platform-organization-farms.controller';
import { FetchPlatformOrganizationsController } from './controllers/fetch-platform-organizations.controller';
import { FetchPlatformUsersController } from './controllers/fetch-platform-users.controller';
import { ResetPlatformUserPasswordController } from './controllers/reset-platform-user-password.controller';
import { UpdatePlatformOrganizationStatusController } from './controllers/update-platform-organization-status.controller';
import { PLATFORM_REPOSITORY } from './repositories/platform.repository';
import { PrismaPlatformRepository } from './repositories/prisma-platform.repository';
import { CreatePlatformOrganizationService } from './services/create-platform-organization.service';
import { CreatePlatformUserService } from './services/create-platform-user.service';
import { FetchPlatformOrganizationFarmsService } from './services/fetch-platform-organization-farms.service';
import { FetchPlatformOrganizationsService } from './services/fetch-platform-organizations.service';
import { FetchPlatformUsersService } from './services/fetch-platform-users.service';
import { ResetPlatformUserPasswordService } from './services/reset-platform-user-password.service';
import { UpdatePlatformOrganizationStatusService } from './services/update-platform-organization-status.service';

@Module({
  imports: [
    PrismaModule,
    CostCategoryModule,
    FarmModule,
    MembershipModule,
    UserModule,
  ],
  controllers: [
    CreatePlatformOrganizationController,
    FetchPlatformOrganizationsController,
    FetchPlatformOrganizationFarmsController,
    CreatePlatformUserController,
    FetchPlatformUsersController,
    ResetPlatformUserPasswordController,
    UpdatePlatformOrganizationStatusController,
  ],
  providers: [
    {
      provide: PLATFORM_REPOSITORY,
      useClass: PrismaPlatformRepository,
    },
    CreatePlatformOrganizationService,
    FetchPlatformOrganizationsService,
    FetchPlatformOrganizationFarmsService,
    CreatePlatformUserService,
    FetchPlatformUsersService,
    ResetPlatformUserPasswordService,
    UpdatePlatformOrganizationStatusService,
  ],
})
export class PlatformApiModule {}
