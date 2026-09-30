import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FarmModule } from '../farm/farm.module';
import { MembershipModule } from '../membership/membership.module';
import { UserModule } from '../user/user.module';
import { CreatePlatformOrganizationController } from './controllers/create-platform-organization.controller';
import { CreatePlatformUserController } from './controllers/create-platform-user.controller';
import { FetchPlatformOrganizationFarmsController } from './controllers/fetch-platform-organization-farms.controller';
import { FetchAdoptionSummaryController } from './controllers/fetch-adoption-summary.controller';
import { FetchPlatformOrganizationsController } from './controllers/fetch-platform-organizations.controller';
import { GetPlatformOrganizationController } from './controllers/get-platform-organization.controller';
import { RemovePlatformOrganizationUserController } from './controllers/remove-platform-organization-user.controller';
import { UpdatePlatformOrganizationController } from './controllers/update-platform-organization.controller';
import { FetchPlatformUsersController } from './controllers/fetch-platform-users.controller';
import { ResetPlatformUserPasswordController } from './controllers/reset-platform-user-password.controller';
import { UpdatePlatformOrganizationStatusController } from './controllers/update-platform-organization-status.controller';
import { CreateSupportUserController } from './controllers/create-support-user.controller';
import { FetchAuditLogsController } from './controllers/fetch-audit-logs.controller';
import { FetchSupportAccessController } from './controllers/fetch-support-access.controller';
import { FetchSupportUsersController } from './controllers/fetch-support-users.controller';
import { GrantSupportAccessController } from './controllers/grant-support-access.controller';
import { RevokeSupportAccessController } from './controllers/revoke-support-access.controller';
import { CreateSupportUserService } from './services/create-support-user.service';
import { FetchAuditLogsService } from './services/fetch-audit-logs.service';
import { FetchSupportAccessService } from './services/fetch-support-access.service';
import { FetchSupportUsersService } from './services/fetch-support-users.service';
import { GrantSupportAccessService } from './services/grant-support-access.service';
import { RevokeSupportAccessService } from './services/revoke-support-access.service';
import { PLATFORM_REPOSITORY } from './repositories/platform.repository';
import { PrismaPlatformRepository } from './repositories/prisma-platform.repository';
import { CreatePlatformOrganizationService } from './services/create-platform-organization.service';
import { CreatePlatformUserService } from './services/create-platform-user.service';
import { FetchPlatformOrganizationFarmsService } from './services/fetch-platform-organization-farms.service';
import { FetchAdoptionSummaryService } from './services/fetch-adoption-summary.service';
import { FetchPlatformOrganizationsService } from './services/fetch-platform-organizations.service';
import { GetPlatformOrganizationService } from './services/get-platform-organization.service';
import { RemovePlatformOrganizationUserService } from './services/remove-platform-organization-user.service';
import { UpdatePlatformOrganizationService } from './services/update-platform-organization.service';
import { FetchPlatformUsersService } from './services/fetch-platform-users.service';
import { ResetPlatformUserPasswordService } from './services/reset-platform-user-password.service';
import { UpdatePlatformOrganizationStatusService } from './services/update-platform-organization-status.service';

@Module({
  imports: [PrismaModule, FarmModule, MembershipModule, UserModule],
  controllers: [
    CreatePlatformOrganizationController,
    FetchPlatformOrganizationsController,
    GetPlatformOrganizationController,
    UpdatePlatformOrganizationController,
    RemovePlatformOrganizationUserController,
    FetchAdoptionSummaryController,
    FetchPlatformOrganizationFarmsController,
    CreatePlatformUserController,
    FetchPlatformUsersController,
    ResetPlatformUserPasswordController,
    UpdatePlatformOrganizationStatusController,
    CreateSupportUserController,
    FetchSupportUsersController,
    GrantSupportAccessController,
    FetchSupportAccessController,
    RevokeSupportAccessController,
    FetchAuditLogsController,
  ],
  providers: [
    {
      provide: PLATFORM_REPOSITORY,
      useClass: PrismaPlatformRepository,
    },
    CreatePlatformOrganizationService,
    FetchPlatformOrganizationsService,
    GetPlatformOrganizationService,
    UpdatePlatformOrganizationService,
    RemovePlatformOrganizationUserService,
    FetchAdoptionSummaryService,
    FetchPlatformOrganizationFarmsService,
    CreatePlatformUserService,
    FetchPlatformUsersService,
    ResetPlatformUserPasswordService,
    UpdatePlatformOrganizationStatusService,
    CreateSupportUserService,
    FetchSupportUsersService,
    GrantSupportAccessService,
    FetchSupportAccessService,
    RevokeSupportAccessService,
    FetchAuditLogsService,
  ],
  exports: [PLATFORM_REPOSITORY],
})
export class PlatformApiModule {}
