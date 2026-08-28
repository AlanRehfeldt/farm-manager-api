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

type CreateAccountPlanInput = {
  name: string;
  description: string;
  code: string;
  parentId?: string;
  organizationId: string;
};

@Injectable()
export class CreateAccountPlanService {
  constructor(
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
  ) {}

  async execute({
    name,
    description,
    code,
    parentId,
    organizationId,
  }: CreateAccountPlanInput) {
    const checkIfCodeExists = await this.accountPlanRepository.findByCode(
      organizationId,
      code,
    );
    if (checkIfCodeExists) {
      throw new ConflictException('Code already exists');
    }

    if (parentId) {
      const checkIfParentIdExists = await this.accountPlanRepository.findById(
        parentId,
        organizationId,
      );
      if (!checkIfParentIdExists) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const accountPlan = await this.accountPlanRepository.create({
      name,
      description,
      code,
      parentId,
      organizationId,
    });

    return { accountPlan };
  }
}
