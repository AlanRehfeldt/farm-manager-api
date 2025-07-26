import { Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from '../repositories/account-plan.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchAccountPlansService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const accountPlans = await this.accountPlanRepository.searchMany(params);
    const total = await this.accountPlanRepository.count(params);

    return {
      results: accountPlans,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
