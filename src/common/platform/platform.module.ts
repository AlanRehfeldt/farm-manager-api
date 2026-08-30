import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PlatformAdminGuard } from './platform-admin.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PlatformAdminGuard],
  exports: [PlatformAdminGuard],
})
export class PlatformModule {}
