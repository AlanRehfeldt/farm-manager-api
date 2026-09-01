import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FarmAdminGuard } from './farm-admin.guard';
import { FarmMembershipGuard } from './farm-membership.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [FarmMembershipGuard, FarmAdminGuard],
  exports: [FarmMembershipGuard, FarmAdminGuard],
})
export class TenancyModule {}
