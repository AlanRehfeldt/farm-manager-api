import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from '../repositories/account-plan.repository';
import { UpdateAccountPlanData } from '../repositories/@types';

@Injectable()
export class UpdateAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute({ id, name, code, type }: UpdateAccountPlanData) {
    const checkIfAccountPlanExists =
      await this.accountPlanRepository.findById(id);
    if (!checkIfAccountPlanExists) {
      throw new NotFoundException('Account plan does not exist');
    }

    if (code) {
      const checkIfCodeExists =
        await this.accountPlanRepository.findByCode(code);
      if (checkIfCodeExists) {
        throw new ConflictException('Code already exists');
      }
    }

    const accountPlan = await this.accountPlanRepository.update({
      id,
      name,
      code,
      type,
    });

    return { accountPlan };
  }
}
