import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MembershipModule } from '../membership/membership.module';
import { FetchOrganizationsController } from './controllers/fetch-organizations.controller';
import { GetOrganizationController } from './controllers/get-organization.controller';
import { UpdateOrganizationController } from './controllers/update-organization.controller';
import { ORGANIZATION_REPOSITORY } from './repositories/organization.repository';
import { PrismaOrganizationRepository } from './repositories/prisma-organization.repository';
import { FetchOrganizationsService } from './services/fetch-organizations.service';
import { GetOrganizationService } from './services/get-organization.service';
import { UpdateOrganizationService } from './services/update-organization.service';

@Module({
  imports: [PrismaModule, forwardRef(() => MembershipModule)],
  controllers: [
    FetchOrganizationsController,
    GetOrganizationController,
    UpdateOrganizationController,
  ],
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: PrismaOrganizationRepository,
    },
    GetOrganizationService,
    FetchOrganizationsService,
    UpdateOrganizationService,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationModule {}
