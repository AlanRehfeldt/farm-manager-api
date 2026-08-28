import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FarmMembershipGuard } from './farm-membership.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [FarmMembershipGuard],
  exports: [FarmMembershipGuard],
})
export class TenancyModule {}
