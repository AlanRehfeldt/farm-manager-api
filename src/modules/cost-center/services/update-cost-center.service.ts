import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCostCenterData } from '../repositories/@types';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';

@Injectable()
export class UpdateCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
  ) {}

  async execute(
    organizationId: string,
    { id, name, description, code, parentId }: UpdateCostCenterData,
  ) {
    const existing = await this.costCenterRepository.findById(
      id,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Cost center does not exist');
    }

    if (code) {
      const duplicate = await this.costCenterRepository.findByCode(
        organizationId,
        code,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Code already exists');
      }
    }

    if (parentId) {
      const parent = await this.costCenterRepository.findById(
        parentId,
        organizationId,
      );
      if (!parent) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const costCenter = await this.costCenterRepository.update({
      id,
      name,
      description,
      code,
      parentId,
    });

    return { costCenter };
  }
}
