import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from '../repositories/account-plan.repository';

@Injectable()
export class DeleteAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const checkIfAccountPlanExists = await this.accountPlanRepository.findById(
      id,
      organizationId,
    );
    if (!checkIfAccountPlanExists) {
      throw new NotFoundException('Account plan does not exist');
    }

    return await this.accountPlanRepository.delete(id);
  }
}
