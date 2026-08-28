import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAccountPlanData } from '../repositories/@types';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from '../repositories/account-plan.repository';

@Injectable()
export class UpdateAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute(
    organizationId: string,
    { id, name, description, code, parentId }: UpdateAccountPlanData,
  ) {
    const existing = await this.accountPlanRepository.findById(
      id,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Account plan does not exist');
    }

    if (code) {
      const duplicate = await this.accountPlanRepository.findByCode(
        organizationId,
        code,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Code already exists');
      }
    }

    if (parentId) {
      const parent = await this.accountPlanRepository.findById(
        parentId,
        organizationId,
      );
      if (!parent) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const accountPlan = await this.accountPlanRepository.update({
      id,
      name,
      description,
      code,
      parentId,
    });

    return { accountPlan };
  }
}
