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
    private readonly costcenterRepository: CostCenterRepository,
  ) {}

  async execute({
    id,
    name,
    description,
    code,
    parentId,
  }: UpdateCostCenterData) {
    if (code) {
      const checkIfCodeExists =
        await this.costcenterRepository.findByCode(code);
      if (checkIfCodeExists) {
        throw new ConflictException('Code already exists');
      }
    }

    if (parentId) {
      const checkIfParentIdExists =
        await this.costcenterRepository.findById(parentId);
      if (checkIfParentIdExists) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const costcenter = await this.costcenterRepository.update({
      id,
      name,
      description,
      code,
      parentId,
    });

    return { costcenter };
  }
}
