import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FarmModule } from '../farm/farm.module';
import { UserModule } from '../user/user.module';
import { CreateMembershipController } from './controllers/create-membership.controller';
import { DeleteOrgUserController } from './controllers/delete-org-user.controller';
import { FetchMembershipsController } from './controllers/fetch-memberships.controller';
import { UpdateOrgUserController } from './controllers/update-org-user.controller';
import { MEMBERSHIP_REPOSITORY } from './repositories/membership.repository';
import { PrismaMembershipRepository } from './repositories/prisma-membership.repository';
import { CreateMembershipService } from './services/create-membership.service';
import { DeleteOrgUserService } from './services/delete-org-user.service';
import { FetchMembershipsService } from './services/fetch-memberships.service';
import { UpdateOrgUserService } from './services/update-org-user.service';

@Module({
  imports: [PrismaModule, UserModule, forwardRef(() => FarmModule)],
  controllers: [
    CreateMembershipController,
    FetchMembershipsController,
    UpdateOrgUserController,
    DeleteOrgUserController,
  ],
  providers: [
    {
      provide: MEMBERSHIP_REPOSITORY,
      useClass: PrismaMembershipRepository,
    },
    CreateMembershipService,
    FetchMembershipsService,
    UpdateOrgUserService,
    DeleteOrgUserService,
  ],
  exports: [MEMBERSHIP_REPOSITORY],
})
export class MembershipModule {}
