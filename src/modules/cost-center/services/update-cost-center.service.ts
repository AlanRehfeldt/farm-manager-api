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
import { UpdateCostCenterData } from '../repositories/@types';

@Injectable()
export class UpdateCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
  ) {}

  async execute({
    id,
    name,
    description,
    code,
    parentId,
  }: UpdateCostCenterData) {
    const checkIfCostCenterIdExists =
      await this.costCenterRepository.findById(id);
    if (checkIfCostCenterIdExists) {
      throw new NotFoundException('Cost center does not exist');
    }

    if (code) {
      const checkIfCodeExists =
        await this.costCenterRepository.findByCode(code);
      if (checkIfCodeExists) {
        throw new ConflictException('Code already exists');
      }
    }

    if (parentId) {
      const checkIfParentIdExists =
        await this.costCenterRepository.findById(parentId);
      if (checkIfParentIdExists) {
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
