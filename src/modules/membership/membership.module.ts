import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FarmModule } from '../farm/farm.module';
import { UserModule } from '../user/user.module';
import { CreateMembershipController } from './controllers/create-membership.controller';
import { DeleteMembershipController } from './controllers/delete-membership.controller';
import { FetchMembershipsController } from './controllers/fetch-memberships.controller';
import { MEMBERSHIP_REPOSITORY } from './repositories/membership.repository';
import { PrismaMembershipRepository } from './repositories/prisma-membership.repository';
import { CreateMembershipService } from './services/create-membership.service';
import { DeleteMembershipService } from './services/delete-membership.service';
import { FetchMembershipsService } from './services/fetch-memberships.service';

@Module({
  imports: [PrismaModule, UserModule, forwardRef(() => FarmModule)],
  controllers: [
    CreateMembershipController,
    FetchMembershipsController,
    DeleteMembershipController,
  ],
  providers: [
    {
      provide: MEMBERSHIP_REPOSITORY,
      useClass: PrismaMembershipRepository,
    },
    CreateMembershipService,
    FetchMembershipsService,
    DeleteMembershipService,
  ],
  exports: [MEMBERSHIP_REPOSITORY],
})
export class MembershipModule {}
