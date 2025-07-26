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
import { CreateAccountPlanData } from '../repositories/@types';

@Injectable()
export class CreateAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute({ name, description, code, parentId }: CreateAccountPlanData) {
    const checkIfCodeExists = await this.accountPlanRepository.findByCode(code);
    if (checkIfCodeExists) {
      throw new ConflictException('Code already exists');
    }

    if (parentId) {
      const checkIfParentIdExists =
        await this.accountPlanRepository.findById(parentId);
      if (!checkIfParentIdExists) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const accountPlan = await this.accountPlanRepository.create({
      name,
      description,
      code,
      parentId,
    });

    return { accountPlan };
  }
}
