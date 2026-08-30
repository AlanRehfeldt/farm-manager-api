import { Module } from '@nestjs/common';
import { CostCategoryModule } from '../cost-category/cost-category.module';
import { MembershipModule } from '../membership/membership.module';
import { OrganizationModule } from '../organization/organization.module';
import { CreateOnboardingController } from './controllers/create-onboarding.controller';
import { CreateOnboardingService } from './services/create-onboarding.service';

@Module({
  imports: [OrganizationModule, MembershipModule, CostCategoryModule],
  controllers: [CreateOnboardingController],
  providers: [CreateOnboardingService],
})
export class OnboardingModule {}
