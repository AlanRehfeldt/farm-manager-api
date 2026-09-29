import { Module } from '@nestjs/common';
import { FarmModule } from '../farm/farm.module';
import { MembershipModule } from '../membership/membership.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserModule } from '../user/user.module';
import { CreateOnboardingController } from './controllers/create-onboarding.controller';
import { CreateOnboardingService } from './services/create-onboarding.service';

@Module({
  imports: [OrganizationModule, MembershipModule, FarmModule, UserModule],
  controllers: [CreateOnboardingController],
  providers: [CreateOnboardingService],
})
export class OnboardingModule {}
