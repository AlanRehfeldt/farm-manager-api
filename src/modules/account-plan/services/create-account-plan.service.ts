import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from '../repositories/account-plan.repository';
import { CreateAccountPlanData } from '../repositories/@types';

@Injectable()
export class CreateAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute({ name, code, type }: CreateAccountPlanData) {
    const checkIfCodeExists = await this.accountPlanRepository.findByCode(code);
    if (checkIfCodeExists) {
      throw new ConflictException('Code already exists');
    }

    const accountPlan = await this.accountPlanRepository.create({
      name,
      code,
      type,
    });

    return { accountPlan };
  }
}
