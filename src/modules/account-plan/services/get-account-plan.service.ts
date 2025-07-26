import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from '../repositories/account-plan.repository';

@Injectable()
export class GetAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute(id: string) {
    const accountPlan = await this.accountPlanRepository.findById(id);

    if (!accountPlan) {
      throw new NotFoundException('Account plan does not exist');
    }

    return { accountPlan };
  }
}
