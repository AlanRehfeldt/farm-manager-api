import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CostCategoryModule } from '../cost-category/cost-category.module';
import { MembershipModule } from '../membership/membership.module';
import { CreateOrganizationController } from './controllers/create-organization.controller';
import { FetchOrganizationsController } from './controllers/fetch-organizations.controller';
import { GetOrganizationController } from './controllers/get-organization.controller';
import { UpdateOrganizationController } from './controllers/update-organization.controller';
import { ORGANIZATION_REPOSITORY } from './repositories/organization.repository';
import { PrismaOrganizationRepository } from './repositories/prisma-organization.repository';
import { CreateOrganizationService } from './services/create-organization.service';
import { FetchOrganizationsService } from './services/fetch-organizations.service';
import { GetOrganizationService } from './services/get-organization.service';
import { UpdateOrganizationService } from './services/update-organization.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MembershipModule),
    CostCategoryModule,
  ],
  controllers: [
    CreateOrganizationController,
    FetchOrganizationsController,
    GetOrganizationController,
    UpdateOrganizationController,
  ],
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: PrismaOrganizationRepository,
    },
    CreateOrganizationService,
    GetOrganizationService,
    FetchOrganizationsService,
    UpdateOrganizationService,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationModule {}
