import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';

type CreateCostCenterInput = {
  name: string;
  description: string;
  code: string;
  parentId?: string;
  organizationId: string;
};

@Injectable()
export class CreateCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
  ) {}

  async execute({
    name,
    description,
    code,
    parentId,
    organizationId,
  }: CreateCostCenterInput) {
    const checkIfCodeExists = await this.costCenterRepository.findByCode(
      organizationId,
      code,
    );
    if (checkIfCodeExists) {
      throw new ConflictException('Code already exists');
    }

    if (parentId) {
      const checkIfParentIdExists = await this.costCenterRepository.findById(
        parentId,
        organizationId,
      );
      if (!checkIfParentIdExists) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const costCenter = await this.costCenterRepository.create({
      name,
      description,
      code,
      parentId,
      organizationId,
    });

    return { costCenter };
  }
}
